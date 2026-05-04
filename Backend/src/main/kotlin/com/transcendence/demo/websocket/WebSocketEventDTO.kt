package com.transcendence.demo.websocket

import com.transcendence.demo.DTO.Response.PresenceUserDTO
import java.time.Instant

data class WebSocketEventDTO(
    val type: String,
    val event: String,
    val userId: Long? = null,
    val message: String? = null,
    val onlineUsers: List<PresenceUserDTO> = emptyList(),
    val timestamp: Instant = Instant.now(),
    val error: String? = null
)