package com.transcendence.demo.controller

import com.transcendence.demo.service.UserService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/users")
class UserController(
    private val userService: UserService
) {
    @Operation(
        summary = "List all registered users",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping
    fun listUsers(authentication: Authentication?): ResponseEntity<Any> {
        if (resolveEmail(authentication).isNullOrBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("success" to false, "message" to "Unauthorized"))
        }

        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "users" to userService.listUsers()
            )
        )
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