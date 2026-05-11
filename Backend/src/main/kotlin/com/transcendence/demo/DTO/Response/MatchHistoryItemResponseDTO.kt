package com.transcendence.demo.DTO.Response

import java.time.OffsetDateTime

data class MatchHistoryItemResponseDTO(
    val id: Long,
    val createdAt: OffsetDateTime,
    val mapId: Long,
    val mapName: String,
    val score: Int? = null,
    val durationSeconds: Int? = null
)