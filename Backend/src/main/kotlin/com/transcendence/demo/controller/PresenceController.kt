package com.transcendence.demo.controller

import com.transcendence.demo.DTO.Response.PresenceUserDTO
import com.transcendence.demo.websocket.PresenceService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/presence")
class PresenceController(
    private val presenceService: PresenceService
) {
    @GetMapping("/online-users")
    fun onlineUsers(): ResponseEntity<Map<String, Any>> {
        val onlineUsers: List<PresenceUserDTO> = presenceService.getOnlineUsers()
        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "onlineUsers" to onlineUsers,
                "count" to onlineUsers.size
            )
        )
    }
}