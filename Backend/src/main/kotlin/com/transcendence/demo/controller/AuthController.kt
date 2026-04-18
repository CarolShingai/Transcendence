package com.transcendence.demo.controller

import com.transcendence.demo.DTO.Request.RegisterRequestDTO
import com.transcendence.demo.DTO.Request.LoginRequestDTO
import com.transcendence.demo.DTO.Response.LoginResponseDTO
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import com.transcendence.demo.service.UserService
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/auth")
class AuthController(private val userService: UserService) {
    @PostMapping("/register")
    fun registerUser(@RequestBody request: RegisterRequestDTO): ResponseEntity<String> {
        val (success, message) = userService.registerUser(request)
        return if (success) {
            userService.createUser(request)
            ResponseEntity.status(HttpStatus.CREATED).body(message)
        } else {
            ResponseEntity.badRequest().body(message)
        }
    }

    @PostMapping("/login")
    fun loginUser(@RequestBody request: LoginRequestDTO): ResponseEntity<LoginResponseDTO> {
        val response = userService.loginUser(request.email, request.password)
        return if (response.success) {
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response)
        }
    }

    @GetMapping("/oauth2/authorize/google")
    fun oauthGoogle(response: HttpServletResponse) {
        response.sendRedirect("/oauth2/authorization/google")
    }

    @GetMapping("/oauth2/authorize/google/success")
    fun oauthGoogleSuccess(authentication: Authentication?): ResponseEntity<LoginResponseDTO> {
        if (authentication == null || !authentication.isAuthenticated) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(LoginResponseDTO(success = false, message = "OAuth2 authentication not found"))
        }

        val principal = authentication.principal as? OAuth2User
        val email = principal?.getAttribute<String>("email")
        val name = principal?.getAttribute<String>("name")

        if (email.isNullOrBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(LoginResponseDTO(success = false, message = "Google account email not found"))
        }

        val response = userService.loginOrCreateGoogleUser(email, name)
        return if (response.success) {
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response)
        }
    }

    @GetMapping("/oauth2/authorize/google/failure")
    fun oauthGoogleFailure(): ResponseEntity<Map<String, Any>> {
        val payload = mapOf(
            "success" to false,
            "message" to "Google OAuth login failed"
        )
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(payload)
    }

    @PostMapping("/logout")
    fun logoutUser(request: HttpServletRequest, response: HttpServletResponse): ResponseEntity<Map<String, Any>> {
        // OAuth2 usa sessão; para JWT, o cliente deve descartar o token após este endpoint.
        request.getSession(false)?.invalidate()
        SecurityContextHolder.clearContext()

        val sessionCookie = Cookie("JSESSIONID", "").apply {
            path = "/"
            maxAge = 0
            isHttpOnly = true
        }
        response.addCookie(sessionCookie)

        val payload = mapOf(
            "success" to true,
            "message" to "Logout successful"
        )
        return ResponseEntity.ok(payload)
    }

    @Operation(
        summary = "Retorna o usuário autenticado a partir do JWT Bearer",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/me")
    fun me(authentication: Authentication?): ResponseEntity<Any> {
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

        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "user" to user
            )
        )
    }
}
