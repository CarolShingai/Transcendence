package com.transcendence.demo.DTO.Response

data class RegisterResponseDTO(
    val success: Boolean = false,
    val message: String = "",
    val userId: Long? = null
)