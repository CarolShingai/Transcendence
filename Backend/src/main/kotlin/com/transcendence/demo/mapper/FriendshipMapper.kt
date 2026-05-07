package com.transcendence.demo.mapper

import com.transcendence.demo.DTO.Response.FriendDTO
import com.transcendence.demo.DTO.Response.FriendshipResponseDTO
import com.transcendence.demo.entity.Friendship
import com.transcendence.demo.entity.User
import org.springframework.stereotype.Component

@Component
class FriendshipMapper {
    fun toDTO(friendship: Friendship): FriendshipResponseDTO {
        val requester = requireNotNull(friendship.requester) { "Friendship requester is required" }
        val receiver = requireNotNull(friendship.receiver) { "Friendship receiver is required" }

        return FriendshipResponseDTO(
            id = requireNotNull(friendship.id) { "Friendship id is required" },
            requesterId = requireNotNull(requester.id) { "Requester id is required" },
            requesterName = requester.name,
            receiverId = requireNotNull(receiver.id) { "Receiver id is required" },
            receiverName = receiver.name,
            status = friendship.status.name,
            createdAt = friendship.createdAt
        )
    }

    fun toFriendDTO(user: User): FriendDTO {
        return FriendDTO(
            id = requireNotNull(user.id) { "User id is required" },
            name = user.name,
            nickname = user.nickname
        )
    }
}
