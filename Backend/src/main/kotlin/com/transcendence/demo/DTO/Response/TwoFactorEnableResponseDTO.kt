package com.transcendence.demo.DTO.Response

data class TwoFactorEnableResponseDTO(
    val success: Boolean,
    val message: String,
    val backupCodes: List<String>? = null
)
