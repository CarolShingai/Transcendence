package com.transcendence.demo.DTO.Request

data class TwoFactorDisableRequestDTO(
    val password: String = "",
    val code: String = ""
)
