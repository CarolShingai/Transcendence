package com.transcendence.demo.DTO.Request

data class LoginRequestDTO(
    val email: String = "",
    val password: String = "",
    val twoFactorCode: String? = null
)