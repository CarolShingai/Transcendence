package com.transcendence.demo.DTO

data class RegisterResponseDTO(
    val success: Boolean = false,
    val message: String = "",
    val userId: Long? = null
)