package com.transcendence.demo.DTO.Request

data class CreateMatchRequestDTO(
    val mapId: Long = 0,
    val score: Int? = null,
    val durationSeconds: Int? = null,
    val metadata: Map<String, Any>? = null
)
