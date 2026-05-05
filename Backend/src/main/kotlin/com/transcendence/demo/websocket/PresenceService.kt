package com.transcendence.demo.websocket

import com.transcendence.demo.DTO.Response.PresenceUserDTO
import com.transcendence.demo.entity.User
import com.transcendence.demo.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.concurrent.ConcurrentHashMap

@Service
class PresenceService(
    private val userRepository: UserRepository
) {
    private val logger = LoggerFactory.getLogger(PresenceService::class.java)
    private val userSessions = ConcurrentHashMap<Long, MutableSet<String>>()
    private val sessionUsers = ConcurrentHashMap<String, Long>()

    fun registerConnection(user: User, sessionId: String): Boolean {
        val userId = requireNotNull(user.id) { "User id is required for presence tracking" }
        val sessions = userSessions.computeIfAbsent(userId) { ConcurrentHashMap.newKeySet() }
        val wasOffline = sessions.isEmpty()

        sessions.add(sessionId)
        sessionUsers[sessionId] = userId

        if (wasOffline) {
            updateUserStatus(user, "online")
            logger.info("User {} is now online", userId)
        }

        return wasOffline
    }

    fun unregisterConnection(sessionId: String): Long? {
        val userId = sessionUsers.remove(sessionId) ?: return null
        val sessions = userSessions[userId] ?: return userId

        sessions.remove(sessionId)
        if (sessions.isEmpty()) {
            userSessions.remove(userId)
            userRepository.findById(userId).ifPresent { user ->
                updateUserStatus(user, "offline")
                logger.info("User {} is now offline", userId)
            }
        }

        return userId
    }

    fun getOnlineUsers(): List<PresenceUserDTO> {
        val onlineIds = userSessions.keys.toList()
        if (onlineIds.isEmpty()) {
            return emptyList()
        }

        return userRepository.findAllById(onlineIds).map { user ->
            user.toPresenceDto()
        }.sortedBy { it.nickname.lowercase() }
    }

    fun isOnline(userId: Long): Boolean {
        return userSessions[userId]?.isNotEmpty() == true
    }

    private fun updateUserStatus(user: User, status: String) {
        if (user.status == status) {
            return
        }

        user.status = status
        userRepository.save(user)
    }

    private fun User.toPresenceDto(): PresenceUserDTO {
        return PresenceUserDTO(
            id = id!!,
            nickname = nickname,
            name = name,
            status = status
        )
    }
}