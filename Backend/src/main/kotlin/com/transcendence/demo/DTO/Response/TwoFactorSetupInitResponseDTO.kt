package com.transcendence.demo.DTO.Response

data class TwoFactorSetupInitResponseDTO(
    val success: Boolean = false,
    val message: String = "",
    val secret: String? = null,
    val otpauthUri: String? = null,
    val qrCodeUrl: String? = null
)
