package com.transcendence.demo.DTO.Response

data class UserResponseDTO(
    val id: Long? = null,
    val nickname: String = "",
    val name: String = "",
    val email: String = "",
    val profilePic: Int = 0,
    val twoFactorEnabled: Boolean = false
)