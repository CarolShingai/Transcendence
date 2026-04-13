package com.transcendence.demo.DTO.Response

data class LoginResponseDTO(
    val success: Boolean = false,
    val message: String = "",
    val token: String? = null,
    val user: UserResponseDTO? = null
)
