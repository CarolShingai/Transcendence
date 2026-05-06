package com.transcendence.demo.controller

import com.transcendence.demo.DTO.Request.ProfileUpdateRequestDTO
import com.transcendence.demo.service.UserService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/profile")
class ProfileController(
    private val userService: UserService
) {
    @Operation(
        summary = "Atualiza o perfil do usuario autenticado",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PatchMapping("/me")
    fun updateMyProfile(
        @RequestBody request: ProfileUpdateRequestDTO,
        authentication: Authentication?
    ): ResponseEntity<Any> {
        if (authentication == null || !authentication.isAuthenticated) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("success" to false, "message" to "Unauthorized"))
        }

        val email = resolveEmail(authentication)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("success" to false, "message" to "User email not found in token"))

        return try {
            val updatedProfile = userService.updateProfile(email, request)
            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "user" to updatedProfile
                )
            )
        } catch (ex: IllegalArgumentException) {
            ResponseEntity.badRequest().body(
                mapOf(
                    "success" to false,
                    "message" to ex.message.orEmpty()
                )
            )
        } catch (ex: NoSuchElementException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                mapOf(
                    "success" to false,
                    "message" to ex.message.orEmpty()
                )
            )
        }
    }

    private fun resolveEmail(authentication: Authentication): String? {
        return when (val principal = authentication.principal) {
            is OAuth2User -> principal.getAttribute<String>("email")
            is String -> principal
            else -> null
        }
    }
}