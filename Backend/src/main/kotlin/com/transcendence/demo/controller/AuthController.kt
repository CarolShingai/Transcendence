package com.transcendence.demo.controller

import com.transcendence.demo.DTO.Request.RegisterRequestDTO
import com.transcendence.demo.DTO.Request.LoginRequestDTO
import com.transcendence.demo.DTO.Request.TwoFactorDisableRequestDTO
import com.transcendence.demo.DTO.Request.TwoFactorLoginRequestDTO
import com.transcendence.demo.DTO.Request.TwoFactorSetupConfirmRequestDTO
import com.transcendence.demo.DTO.Response.LoginResponseDTO
import com.transcendence.demo.DTO.Response.TwoFactorSetupInitResponseDTO
import com.transcendence.demo.DTO.Response.TwoFactorStatusResponseDTO
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import com.transcendence.demo.service.UserService
import com.transcendence.demo.service.TwoFactorService
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
    private val twoFactorService: TwoFactorService
) {
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

    @PostMapping("/login/2fa")
    fun loginTwoFactor(@RequestBody request: TwoFactorLoginRequestDTO): ResponseEntity<LoginResponseDTO> {
        val response = userService.completeTwoFactorLogin(request.twoFactorToken, request.code)
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

        val oauthAuthentication = authentication as? OAuth2AuthenticationToken
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(LoginResponseDTO(success = false, message = "Invalid OAuth2 authentication type"))

        if (oauthAuthentication.authorizedClientRegistrationId != "google") {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(LoginResponseDTO(success = false, message = "Invalid OAuth2 provider"))
        }

        val principal = oauthAuthentication.principal as? OAuth2User
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(LoginResponseDTO(success = false, message = "OAuth2 principal not found"))

        val email = principal.getAttribute<String>("email")
        val name = principal.getAttribute<String>("name")
        val emailVerified = parseEmailVerified(principal.getAttribute<Any>("email_verified"))

        if (!emailVerified) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(LoginResponseDTO(success = false, message = "Google account email is not verified"))
        }

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

    @Operation(
        summary = "Inicia a configuração do 2FA do usuário autenticado",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PostMapping("/2fa/setup/init")
    fun initTwoFactorSetup(authentication: Authentication?): ResponseEntity<TwoFactorSetupInitResponseDTO> {
        val email = resolveEmail(authentication)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(TwoFactorSetupInitResponseDTO(success = false, message = "Unauthorized"))

        val user = userService.getUserByEmail(email)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(TwoFactorSetupInitResponseDTO(success = false, message = "User not found"))

        val provisioning = twoFactorService.initializeUser(user)
        return ResponseEntity.ok(
            TwoFactorSetupInitResponseDTO(
                success = true,
                message = "Two-factor setup initialized",
                secret = provisioning.secret,
                otpauthUri = provisioning.otpauthUri,
                qrCodeUrl = provisioning.qrCodeUrl
            )
        )
    }

    @Operation(
        summary = "Confirma o 2FA com o código do autenticador",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PostMapping("/2fa/setup/confirm")
    fun confirmTwoFactorSetup(
        authentication: Authentication?,
        @RequestBody request: TwoFactorSetupConfirmRequestDTO
    ): ResponseEntity<TwoFactorStatusResponseDTO> {
        val email = resolveEmail(authentication)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(TwoFactorStatusResponseDTO(success = false, message = "Unauthorized"))

        val user = userService.getUserByEmail(email)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(TwoFactorStatusResponseDTO(success = false, message = "User not found"))

        val success = twoFactorService.confirmUser(user, request.code)
        return if (success) {
            ResponseEntity.ok(
                TwoFactorStatusResponseDTO(
                    success = true,
                    message = "Two-factor authentication enabled",
                    enabled = true,
                    confirmedAt = user.twoFactorConfirmedAt
                )
            )
        } else {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(TwoFactorStatusResponseDTO(success = false, message = "Invalid two-factor code"))
        }
    }

    @Operation(
        summary = "Desativa o 2FA do usuário autenticado",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PostMapping("/2fa/disable")
    fun disableTwoFactor(
        authentication: Authentication?,
        @RequestBody request: TwoFactorDisableRequestDTO
    ): ResponseEntity<TwoFactorStatusResponseDTO> {
        val email = resolveEmail(authentication)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(TwoFactorStatusResponseDTO(success = false, message = "Unauthorized"))

        val user = userService.getUserByEmail(email)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(TwoFactorStatusResponseDTO(success = false, message = "User not found"))

        if (!user.passwordHash.isBlank() && !org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().matches(request.password, user.passwordHash)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(TwoFactorStatusResponseDTO(success = false, message = "Invalid password"))
        }

        val success = twoFactorService.disableUser(user, request.code)
        return if (success) {
            ResponseEntity.ok(
                TwoFactorStatusResponseDTO(
                    success = true,
                    message = "Two-factor authentication disabled",
                    enabled = false,
                    confirmedAt = null
                )
            )
        } else {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(TwoFactorStatusResponseDTO(success = false, message = "Invalid two-factor code"))
        }
    }

    @Operation(
        summary = "Retorna o status atual do 2FA do usuário autenticado",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/2fa/status")
    fun twoFactorStatus(authentication: Authentication?): ResponseEntity<TwoFactorStatusResponseDTO> {
        val email = resolveEmail(authentication)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(TwoFactorStatusResponseDTO(success = false, message = "Unauthorized"))

        val user = userService.getUserByEmail(email)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(TwoFactorStatusResponseDTO(success = false, message = "User not found"))

        val (enabled, confirmedAt) = twoFactorService.getStatus(user)
        return ResponseEntity.ok(
            TwoFactorStatusResponseDTO(
                success = true,
                message = "Two-factor status retrieved",
                enabled = enabled,
                confirmedAt = confirmedAt
            )
        )
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
