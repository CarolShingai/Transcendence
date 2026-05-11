package com.transcendence.demo.DTO.Response

data class CreateMatchResponseDTO(
    val success: Boolean,
    val message: String,
    val matchId: Long? = null,
    val userId: Long? = null,
    val mapId: Long? = null
)
