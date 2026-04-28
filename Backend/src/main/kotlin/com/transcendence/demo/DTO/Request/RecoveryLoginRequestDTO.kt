package com.transcendence.demo.DTO.Request

data class RecoveryLoginRequestDTO(
    val email: String = "",
    val recoveryCode: String = ""
)
