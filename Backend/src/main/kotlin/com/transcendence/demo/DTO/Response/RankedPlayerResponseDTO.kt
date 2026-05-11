package com.transcendence.demo.DTO.Response

data class RankedPlayerResponseDTO(
    val position: Int,
    val userId: Long,
    val nickname: String,
    val bestScore: Int
)