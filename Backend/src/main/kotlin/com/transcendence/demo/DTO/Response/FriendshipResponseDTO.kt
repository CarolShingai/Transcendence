package com.transcendence.demo.DTO.Response

import java.time.LocalDateTime

data class FriendshipResponseDTO(
    val id: Long,
    val requesterId: Long,
    val requesterName: String,
    val requesterNickname: String,
    val requesterProfilePic: Int = 0,
    val receiverId: Long,
    val receiverName: String,
    val receiverNickname: String,
    val receiverProfilePic: Int = 0,
    val status: String,
    val direction: String? = null,
    val createdAt: LocalDateTime?
)
