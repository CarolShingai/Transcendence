package com.transcendence.demo.DTO.Request

data class RegisterRequestDTO(
    val nickname: String = "",
    val name: String = "",
    val email: String = "",
    val password: String = "",
    val profilePic: Int = 0
)