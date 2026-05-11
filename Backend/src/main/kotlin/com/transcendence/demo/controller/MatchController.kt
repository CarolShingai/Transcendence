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
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/matches")
class MatchController(
    private val matchService: MatchService,
    private val userService: UserService
) {

    @Operation(
        summary = "Lista o histórico de partidas do usuário autenticado",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping
    fun listMyMatches(authentication: Authentication?): ResponseEntity<Any> {
        if (authentication == null || !authentication.isAuthenticated) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("success" to false, "message" to "Unauthorized"))
        }

        val email = when (val principal = authentication.principal) {
            is OAuth2User -> principal.getAttribute<String>("email")
            is String -> principal
            else -> null
        }

        if (email.isNullOrBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("success" to false, "message" to "User email not found in token"))
        }

        val user = userService.getUserProfileByEmail(email)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("success" to false, "message" to "User not found"))

        val matches = matchService.listMatchesForUser(user.id!!)

        return ResponseEntity.ok(mapOf("matches" to matches))
    }

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
            val result = matchService.createMatch(
                userId = user.id!!,
                mapId = request.mapId,
                score = request.score,
                durationSeconds = request.durationSeconds,
                metadata = request.metadata,
                clientMatchId = request.clientMatchId
            )

            val status = if (result.created) HttpStatus.CREATED else HttpStatus.OK

            ResponseEntity.status(status).body(
                CreateMatchResponseDTO(
                    success = true,
                    message = if (result.created) "Match registered successfully" else "Match already registered",
                    matchId = result.match.id,
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
