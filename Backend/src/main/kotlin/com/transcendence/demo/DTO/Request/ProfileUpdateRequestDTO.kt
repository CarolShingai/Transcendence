package com.transcendence.demo.DTO.Request

data class ProfileUpdateRequestDTO(
    val name: String? = null,
    val nickname: String? = null,
    val profilePic: Int? = null
)