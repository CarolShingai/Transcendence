package com.transcendence.demo.DTO.Response

import java.time.LocalDateTime

data class FriendshipResponseDTO(
    val id: Long,
    val requesterId: Long,
    val requesterName: String,
    val receiverId: Long,
    val receiverName: String,
    val status: String,
    val createdAt: LocalDateTime?
)
