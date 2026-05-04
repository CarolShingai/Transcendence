package com.transcendence.demo.DTO.Response

data class PresenceUserDTO(
    val id: Long,
    val nickname: String,
    val name: String,
    val email: String,
    val status: String = "online"
)