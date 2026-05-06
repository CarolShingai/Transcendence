package com.transcendence.demo.DTO.Response

data class LoginResponseDTO(
    val success: Boolean = false,
    val message: String = "",
    val token: String? = null,
    val user: UserResponseDTO? = null,
    val requiresTwoFactor: Boolean = false,
    val twoFactorToken: String? = null,
    val twoFactorQrCode: String? = null
)
