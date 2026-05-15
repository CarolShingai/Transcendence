package com.transcendence.demo.controller

import com.transcendence.demo.DTO.Request.SendFriendRequestDTO
import com.transcendence.demo.DTO.Response.FriendDTO
import com.transcendence.demo.DTO.Response.FriendshipResponseDTO
import com.transcendence.demo.service.FriendshipService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/friends")
class FriendshipController(
    private val friendshipService: FriendshipService
) {
    @Operation(
        summary = "Send a friend request",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PostMapping("/request")
    fun sendFriendRequest(
        @RequestBody request: SendFriendRequestDTO,
        authentication: Authentication?
    ): ResponseEntity<Any> {
        val email = resolveEmail(authentication)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(friendshipService.sendFriendRequest(email, request))
    }

    @Operation(
        summary = "Accept a friend request",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PatchMapping("/{requestId}/accept")
    fun acceptFriendRequest(
        @PathVariable requestId: Long,
        authentication: Authentication?
    ): ResponseEntity<Any> {
        val email = resolveEmail(authentication)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        return ResponseEntity.ok(friendshipService.acceptFriendRequest(email, requestId))
    }

    @Operation(
        summary = "Reject a friend request",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PatchMapping("/{requestId}/reject")
    fun rejectFriendRequest(
        @PathVariable requestId: Long,
        authentication: Authentication?
    ): ResponseEntity<Any> {
        val email = resolveEmail(authentication)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        friendshipService.rejectFriendRequest(email, requestId)
        return ResponseEntity.noContent().build()
    }

    @Operation(
        summary = "Remove a friend",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @DeleteMapping("/{friendId}")
    fun removeFriend(
        @PathVariable friendId: Long,
        authentication: Authentication?
    ): ResponseEntity<Any> {
        val email = resolveEmail(authentication)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        friendshipService.removeFriend(email, friendId)
        return ResponseEntity.noContent().build()
    }

    @Operation(
        summary = "List pending friend requests for the current user",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/requests")
    fun listPendingRequests(authentication: Authentication?): ResponseEntity<Any> {
        val email = resolveEmail(authentication)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        return ResponseEntity.ok(friendshipService.listPendingRequests(email))
    }

    @Operation(
        summary = "List accepted friends",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping
    fun listFriends(authentication: Authentication?): ResponseEntity<Any> {
        val email = resolveEmail(authentication)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        return ResponseEntity.ok(friendshipService.listFriends(email))
    }

    private fun resolveEmail(authentication: Authentication?): String? {
        if (authentication == null || !authentication.isAuthenticated) {
            return null
        }

        return when (val principal = authentication.principal) {
            is OAuth2User -> principal.getAttribute<String>("email")
            is String -> principal
            else -> null
        }
    }
}
