package com.transcendence.demo.DTO

data class LoginRequestDTO(
    val username: String = "",
    val password: String = ""
)

data class LoginResponseDTO(
    val success: Boolean = false,
    val message: String = "",
    val user: UserResponseDTO? = null
)
