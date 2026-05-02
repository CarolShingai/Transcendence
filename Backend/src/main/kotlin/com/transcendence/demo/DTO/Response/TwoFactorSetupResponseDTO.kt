package com.transcendence.demo.DTO.Response

data class TwoFactorSetupResponseDTO(
    val qrCodeUrl: String,
    val tempSecret: String
)
