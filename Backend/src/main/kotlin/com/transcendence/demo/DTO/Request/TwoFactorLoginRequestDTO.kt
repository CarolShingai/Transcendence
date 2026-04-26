package com.transcendence.demo.DTO.Request

data class TwoFactorLoginRequestDTO(
    val twoFactorToken: String = "",
    val code: String = ""
)