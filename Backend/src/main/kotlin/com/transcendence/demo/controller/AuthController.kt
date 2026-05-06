package com.transcendence.demo.controller

import com.transcendence.demo.DTO.Request.LoginRequestDTO
import com.transcendence.demo.DTO.Request.RegisterRequestDTO
import com.transcendence.demo.DTO.Request.TwoFactorDisableRequestDTO
import com.transcendence.demo.DTO.Request.TwoFactorLoginRequestDTO
import com.transcendence.demo.DTO.Request.TwoFactorPreferenceRequestDTO
import com.transcendence.demo.DTO.Request.TwoFactorSetupConfirmRequestDTO
import com.transcendence.demo.DTO.Response.LoginResponseDTO
import com.transcendence.demo.DTO.Response.RegisterResponseDTO
import com.transcendence.demo.DTO.Response.TwoFactorDisableResponseDTO
import com.transcendence.demo.DTO.Response.TwoFactorEnableResponseDTO
import com.transcendence.demo.DTO.Response.TwoFactorSetupResponseDTO
import com.transcendence.demo.providers.JwtTokenGenerator
import com.transcendence.demo.service.UserService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/auth")
class AuthController(
    private val userService: UserService,
    private val jwtTokenGenerator: JwtTokenGenerator
) {
    @PostMapping("/register")
    fun registerUser(@RequestBody request: RegisterRequestDTO): ResponseEntity<RegisterResponseDTO> {
        val (success, message) = userService.registerUser(request)
        return if (success) {
            val user = userService.createUser(request)
            ResponseEntity.status(HttpStatus.CREATED).body(
                RegisterResponseDTO(
                    success = true,
                    message = message,
                    userId = user.id
                )
            )
        } else {
            ResponseEntity.badRequest().body(
                RegisterResponseDTO(
                    success = false,
                    message = message
                )
            )
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

    @PostMapping("/verify-2fa")
    fun verifyTwoFactor(@RequestBody request: TwoFactorLoginRequestDTO): ResponseEntity<LoginResponseDTO> {
        val userId = jwtTokenGenerator.extractUserId(request.twoFactorToken)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(LoginResponseDTO(success = false, message = "Invalid 2FA token"))

        if (!jwtTokenGenerator.isTwoFactorChallengeToken(request.twoFactorToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(LoginResponseDTO(success = false, message = "Invalid 2FA token"))
        }

        val response = userService.loginWithTwoFactor(userId, request.code)
        return if (response.success) {
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response)
        }
    }

    @Operation(
        summary = "Setup 2FA for the authenticated user",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PostMapping("/2fa/setup")
    fun setupTwoFactor(authentication: Authentication): ResponseEntity<TwoFactorSetupResponseDTO> {
        if (authentication == null || !authentication.isAuthenticated) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }

        val email = when (val principal = authentication.principal) {
            is OAuth2User -> principal.getAttribute<String>("email")
            is String -> principal
            else -> null
        }

        if (email.isNullOrBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }

        val user = userService.getUserProfileByEmail(email)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).build()

        val response = userService.setupTwoFactor(user.id!!)
        return ResponseEntity.ok(response)
    }

    @Operation(
        summary = "Enable 2FA for the authenticated user",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PostMapping("/2fa/enable")
    fun enableTwoFactor(
        @RequestBody request: TwoFactorSetupConfirmRequestDTO,
        authentication: Authentication
    ): ResponseEntity<TwoFactorEnableResponseDTO> {
        if (authentication == null || !authentication.isAuthenticated) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(TwoFactorEnableResponseDTO(false, "Unauthorized"))
        }

        val email = when (val principal = authentication.principal) {
            is OAuth2User -> principal.getAttribute<String>("email")
            is String -> principal
            else -> null
        }

        if (email.isNullOrBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(TwoFactorEnableResponseDTO(false, "Unauthorized"))
        }

        val user = userService.getUserProfileByEmail(email)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(TwoFactorEnableResponseDTO(false, "User not found"))

        val response = userService.enableTwoFactor(user.id!!, request)
        return if (response.success) {
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.badRequest().body(response)
        }
    }

    @Operation(
        summary = "Disable 2FA for the authenticated user",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PostMapping("/2fa/disable")
    fun disableTwoFactor(
        @RequestBody request: TwoFactorDisableRequestDTO,
        authentication: Authentication
    ): ResponseEntity<TwoFactorDisableResponseDTO> {
        if (authentication == null || !authentication.isAuthenticated) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(TwoFactorDisableResponseDTO(false, "Unauthorized"))
        }

        val email = when (val principal = authentication.principal) {
            is OAuth2User -> principal.getAttribute<String>("email")
            is String -> principal
            else -> null
        }

        if (email.isNullOrBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(TwoFactorDisableResponseDTO(false, "Unauthorized"))
        }

        val user = userService.getUserProfileByEmail(email)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(TwoFactorDisableResponseDTO(false, "User not found"))

        val response = userService.disableTwoFactor(user.id!!, request)
        return if (response.success) {
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.badRequest().body(response)
        }
    }

    @Operation(
        summary = "Enable or disable 2FA for the authenticated user",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PostMapping("/2fa/preference")
    fun updateTwoFactorPreference(
        @RequestBody request: TwoFactorPreferenceRequestDTO,
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
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
                .body(mapOf("success" to false, "message" to "Unauthorized"))
        }

        val user = userService.getUserProfileByEmail(email)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("success" to false, "message" to "User not found"))

        val updated = userService.updateTwoFactorPreference(user.id!!, request.enabled)

        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "twoFactorEnabled" to updated.twoFactorEnabled,
                "message" to if (updated.twoFactorEnabled) "2FA enabled" else "2FA disabled"
            )
        )
    }

    @GetMapping("/oauth2/authorize/google")
    fun oauthGoogle(response: HttpServletResponse) {
        response.sendRedirect("/oauth2/authorization/google")
    }

    @GetMapping("/oauth2/authorize/google/success")
    fun oauthGoogleSuccess(authentication: Authentication?, response: HttpServletResponse) {
        if (authentication == null || !authentication.isAuthenticated) {
            response.sendRedirect("http://localhost:3000/login?error=oauth2")
            return
        }

        val oauthAuthentication = authentication as? OAuth2AuthenticationToken
        if (oauthAuthentication == null || oauthAuthentication.authorizedClientRegistrationId != "google") {
            response.sendRedirect("http://localhost:3000/login?error=oauth2")
            return
        }

        val principal = oauthAuthentication.principal as? OAuth2User
        val email = principal?.getAttribute<String>("email")
        val name = principal?.getAttribute<String>("name")
        val emailVerified = parseEmailVerified(principal?.getAttribute<Any>("email_verified"))

        if (email.isNullOrBlank() || !emailVerified) {
            response.sendRedirect("http://localhost:3000/login?error=oauth2")
            return
        }

        val loginResponse = userService.loginOrCreateGoogleUser(email, name)
        if (loginResponse.success && loginResponse.token != null) {
            val frontendUrl = "http://localhost:3000/google-callback?token=${loginResponse.token}"
            response.sendRedirect(frontendUrl)
        } else {
            response.sendRedirect("http://localhost:3000/login?error=oauth2")
        }
    }

    @GetMapping("/oauth2/authorize/google/failure")
    fun oauthGoogleFailure(request: HttpServletRequest): ResponseEntity<Map<String, Any>> {
        val error = request.getParameter("error")
        val errorDescription = request.getParameter("error_description")

        val payload = mutableMapOf<String, Any>(
            "success" to false,
            "message" to "Google OAuth login failed"
        )

        if (!error.isNullOrBlank()) {
            payload["error"] = error
        }
        if (!errorDescription.isNullOrBlank()) {
            payload["error_description"] = errorDescription
        }

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

    private fun parseEmailVerified(value: Any?): Boolean {
        return when (value) {
            is Boolean -> value
            is String -> value.equals("true", ignoreCase = true)
            else -> false
        }
    }
}
