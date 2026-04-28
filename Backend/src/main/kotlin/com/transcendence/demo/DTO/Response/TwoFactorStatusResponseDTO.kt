package com.transcendence.demo.DTO.Response

import java.time.LocalDateTime

data class TwoFactorStatusResponseDTO(
    val success: Boolean = false,
    val message: String = "",
    val enabled: Boolean = false,
    val confirmedAt: LocalDateTime? = null
)
