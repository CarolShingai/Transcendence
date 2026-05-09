package com.transcendence.demo.service

import com.transcendence.demo.DTO.Request.SendFriendRequestDTO
import com.transcendence.demo.DTO.Response.FriendDTO
import com.transcendence.demo.DTO.Response.FriendshipResponseDTO
import com.transcendence.demo.entity.Friendship
import com.transcendence.demo.entity.FriendshipStatus
import com.transcendence.demo.entity.User
import com.transcendence.demo.mapper.FriendshipMapper
import com.transcendence.demo.repository.FriendshipRepository
import com.transcendence.demo.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class FriendshipService(
    private val friendshipRepository: FriendshipRepository,
    private val userRepository: UserRepository,
    private val friendshipMapper: FriendshipMapper
) {

    fun sendFriendRequest(requesterEmail: String, request: SendFriendRequestDTO): FriendshipResponseDTO {
        val requester = findAuthenticatedUser(requesterEmail)
        val receiver = findUserById(request.receiverId)

        if (requester.id == receiver.id) {
            throw IllegalArgumentException("You cannot send a friend request to yourself")
        }

        if (friendshipRepository.existsBetweenUsers(requester.id!!, receiver.id!!)) {
            throw IllegalArgumentException("A friendship relation already exists between these users")
        }

        val friendship = Friendship(
            requester = requester,
            receiver = receiver,
            status = FriendshipStatus.PENDING
        )

        return friendshipMapper.toDTO(friendshipRepository.save(friendship), requester.id)
    }

    fun acceptFriendRequest(requesterEmail: String, requestId: Long): FriendshipResponseDTO {
        val receiver = findAuthenticatedUser(requesterEmail)
        val friendship = findFriendshipById(requestId)

        ensureReceiverIsOwner(receiver, friendship)
        ensureRequestIsPending(friendship)

        friendship.status = FriendshipStatus.ACCEPTED
        return friendshipMapper.toDTO(friendshipRepository.save(friendship), receiver.id)
    }

    fun rejectFriendRequest(requesterEmail: String, requestId: Long): FriendshipResponseDTO {
        val receiver = findAuthenticatedUser(requesterEmail)
        val friendship = findFriendshipById(requestId)

        ensureReceiverIsOwner(receiver, friendship)
        ensureRequestIsPending(friendship)

        friendship.status = FriendshipStatus.REJECTED
        return friendshipMapper.toDTO(friendshipRepository.save(friendship), receiver.id)
    }

    @Transactional(readOnly = true)
    fun listPendingRequests(requesterEmail: String): List<FriendshipResponseDTO> {
        val user = findAuthenticatedUser(requesterEmail)
        return friendshipRepository.findPendingFriendshipsByUserId(user.id!!)
            .map { friendshipMapper.toDTO(it, user.id) }
    }

    @Transactional(readOnly = true)
    fun listFriends(requesterEmail: String): List<FriendDTO> {
        val user = findAuthenticatedUser(requesterEmail)
        return friendshipRepository.findFriends(user.id!!)
            .map(friendshipMapper::toFriendDTO)
    }

    private fun findAuthenticatedUser(email: String): User {
        if (email.isBlank()) {
            throw IllegalArgumentException("Authenticated user email is required")
        }

        return userRepository.findByEmail(email)
            ?: throw IllegalArgumentException("Authenticated user not found")
    }

    private fun findUserById(userId: Long): User {
        return userRepository.findById(userId).orElseThrow {
            IllegalArgumentException("Receiver user not found")
        }
    }

    private fun findFriendshipById(requestId: Long): Friendship {
        return friendshipRepository.findById(requestId).orElseThrow {
            IllegalArgumentException("Friend request not found")
        }
    }

    private fun ensureReceiverIsOwner(receiver: User, friendship: Friendship) {
        val friendshipReceiverId = friendship.receiver?.id
            ?: throw IllegalArgumentException("Friend request is malformed")

        if (friendshipReceiverId != receiver.id) {
            throw IllegalArgumentException("Only the receiver can process this friend request")
        }
    }

    private fun ensureRequestIsPending(friendship: Friendship) {
        if (friendship.status != FriendshipStatus.PENDING) {
            throw IllegalArgumentException("Friend request is already processed")
        }
    }

}
