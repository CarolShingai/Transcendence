package com.transcendence.demo.controller

import com.transcendence.demo.DTO.Request.CreateMatchRequestDTO
import com.transcendence.demo.DTO.Response.CreateMatchResponseDTO
import com.transcendence.demo.service.MatchService
import com.transcendence.demo.service.UserService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/matches")
class MatchController(
    private val matchService: MatchService,
    private val userService: UserService
) {

    @Operation(
        summary = "Registra uma partida finalizada do usuário autenticado",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PostMapping
    fun createMatch(
        @RequestBody request: CreateMatchRequestDTO,
        authentication: Authentication?
    ): ResponseEntity<CreateMatchResponseDTO> {
        if (authentication == null || !authentication.isAuthenticated) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(CreateMatchResponseDTO(false, "Unauthorized"))
        }

        val email = when (val principal = authentication.principal) {
            is OAuth2User -> principal.getAttribute<String>("email")
            is String -> principal
            else -> null
        }

        if (email.isNullOrBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(CreateMatchResponseDTO(false, "User email not found in token"))
        }

        val user = userService.getUserProfileByEmail(email)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(CreateMatchResponseDTO(false, "User not found"))

        return try {
            val match = matchService.createMatch(
                userId = user.id!!,
                mapId = request.mapId,
                score = request.score,
                durationSeconds = request.durationSeconds,
                metadata = request.metadata
            )

            ResponseEntity.status(HttpStatus.CREATED).body(
                CreateMatchResponseDTO(
                    success = true,
                    message = "Match registered successfully",
                    matchId = match.id,
                    userId = user.id,
                    mapId = request.mapId
                )
            )
        } catch (ex: IllegalArgumentException) {
            ResponseEntity.badRequest().body(
                CreateMatchResponseDTO(false, ex.message ?: "Invalid match data")
            )
        } catch (ex: NoSuchElementException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                CreateMatchResponseDTO(false, ex.message ?: "Resource not found")
            )
        }
    }
}
