package com.transcendence.demo.config

import com.transcendence.demo.websocket.WebSocketPresenceHandler
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry

@Configuration
@EnableWebSocket
class WebSocketConfig(
    private val webSocketPresenceHandler: WebSocketPresenceHandler,
    @Value("\${app.cors.allowed-origins:http://localhost:3000}")
    private val corsAllowedOrigins: String
) : WebSocketConfigurer {

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry
            .addHandler(webSocketPresenceHandler, "/ws")
            .setAllowedOrigins(*allowedOrigins())
    }

    private fun allowedOrigins(): Array<String> {
        return corsAllowedOrigins
            .split(",")
            .map { it.trim() }
            .filter { it.isNotBlank() }
            .toTypedArray()
    }
}