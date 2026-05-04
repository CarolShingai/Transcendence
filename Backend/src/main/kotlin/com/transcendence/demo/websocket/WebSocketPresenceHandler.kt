package com.transcendence.demo.websocket

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.databind.SerializationFeature
import com.transcendence.demo.providers.JwtTokenGenerator
import com.transcendence.demo.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import org.springframework.web.util.UriComponentsBuilder
import java.util.concurrent.ConcurrentHashMap

@Component
class WebSocketPresenceHandler(
    private val jwtTokenGenerator: JwtTokenGenerator,
    private val userRepository: UserRepository,
    private val presenceService: PresenceService
) : TextWebSocketHandler() {
    private val logger = LoggerFactory.getLogger(WebSocketPresenceHandler::class.java)
    private val sessions = ConcurrentHashMap<String, WebSocketSession>()
    private val objectMapper = jacksonObjectMapper()
        .registerModule(JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)

    override fun afterConnectionEstablished(session: WebSocketSession) {
        try {
            val token = extractToken(session)
                ?: throw IllegalArgumentException("Missing token")

            if (!jwtTokenGenerator.isAccessTokenValid(token)) {
                throw IllegalArgumentException("Invalid token")
            }

            val userId = jwtTokenGenerator.extractUserId(token)
                ?: throw IllegalArgumentException("User id not found")

            val user = userRepository.findById(userId).orElse(null)
                ?: throw IllegalArgumentException("User not found")

            session.attributes["userId"] = userId
            session.attributes["email"] = user.email
            sessions[session.id] = session
            val becameOnline = presenceService.registerConnection(user, session.id)

            logger.info("WebSocket connected: session={}, userId={}", session.id, userId)
            val presenceEvent = WebSocketEventDTO(
                type = "presence",
                event = if (becameOnline) "online" else "connected",
                userId = userId,
                onlineUsers = presenceService.getOnlineUsers()
            )

            sendEvent(session, presenceEvent)
            broadcastEventExcluding(presenceEvent, session.id)
        } catch (ex: Exception) {
            logger.warn("WebSocket connection rejected: {}", ex.message)
            safeSendError(session, ex.message ?: "Connection rejected")
            closeQuietly(session, CloseStatus.POLICY_VIOLATION)
        }
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        val userId = session.attributes["userId"] as? Long
        if (userId == null) {
            safeSendError(session, "Unauthenticated session")
            closeQuietly(session, CloseStatus.POLICY_VIOLATION)
            return
        }

        try {
            val payload = objectMapper.readValue(message.payload, WebSocketIncomingMessageDTO::class.java)
            logger.info("WebSocket message received from userId={}: {}", userId, payload.message)

            sendEvent(
                session,
                WebSocketEventDTO(
                    type = "message",
                    event = "received",
                    userId = userId,
                    message = payload.message ?: ""
                )
            )
        } catch (ex: Exception) {
            logger.warn("Invalid WebSocket payload for session {}: {}", session.id, ex.message)
            safeSendError(session, "Invalid JSON payload")
        }
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        val userId = presenceService.unregisterConnection(session.id)
        sessions.remove(session.id)
        if (userId != null) {
            logger.info("WebSocket disconnected: session={}, userId={}, status={}", session.id, userId, status.code)
            broadcastEvent(
                WebSocketEventDTO(
                    type = "presence",
                    event = "offline",
                    userId = userId,
                    onlineUsers = presenceService.getOnlineUsers()
                )
            )
        } else {
            logger.info("WebSocket disconnected: session={}, status={}", session.id, status.code)
        }
    }

    override fun handleTransportError(session: WebSocketSession, exception: Throwable) {
        logger.warn("WebSocket transport error for session {}: {}", session.id, exception.message)
        safeSendError(session, "Transport error")
    }

    private fun extractToken(session: WebSocketSession): String? {
        val uri = session.uri ?: return null
        return UriComponentsBuilder.fromUri(uri).build().queryParams.getFirst("token")?.trim()
    }

    private fun sendEvent(session: WebSocketSession, event: WebSocketEventDTO) {
        if (!session.isOpen) {
            return
        }

        session.sendMessage(TextMessage(objectMapper.writeValueAsString(event)))
    }

    private fun broadcastEvent(event: WebSocketEventDTO) {
        sessions.values.forEach { session ->
            runCatching {
                sendEvent(session, event)
            }
        }
    }

    private fun broadcastEventExcluding(event: WebSocketEventDTO, excludeSessionId: String) {
        sessions.values.forEach { session ->
            if (session.id != excludeSessionId) {
                runCatching {
                    sendEvent(session, event)
                }
            }
        }
    }

    private fun safeSendError(session: WebSocketSession, message: String) {
        if (!session.isOpen) {
            return
        }

        runCatching {
            sendEvent(
                session,
                WebSocketEventDTO(
                    type = "error",
                    event = "error",
                    error = message
                )
            )
        }
    }

    private fun closeQuietly(session: WebSocketSession, closeStatus: CloseStatus) {
        runCatching {
            if (session.isOpen) {
                session.close(closeStatus)
            }
        }
    }
}