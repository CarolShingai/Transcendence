package com.transcendence.demo.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.transcendence.demo.DTO.Request.TwoFactorDisableRequestDTO
import com.transcendence.demo.DTO.Request.TwoFactorLoginRequestDTO
import com.transcendence.demo.DTO.Request.TwoFactorSetupConfirmRequestDTO
import com.transcendence.demo.entity.User
import com.transcendence.demo.providers.JwtTokenGenerator
import com.transcendence.demo.repository.UserRepository
import com.transcendence.demo.service.TwoFactorService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthTwoFactorControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    private val objectMapper: ObjectMapper = jacksonObjectMapper()

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var jwtTokenGenerator: JwtTokenGenerator

    @Autowired
    private lateinit var twoFactorService: TwoFactorService

    private val passwordEncoder = BCryptPasswordEncoder()

    @BeforeEach
    fun setup() {
        userRepository.deleteAll()
    }

    @Nested
    @DisplayName("POST /auth/2fa/setup")
    inner class SetupTwoFactor {

        @Test
        fun `should setup 2FA for authenticated user`() {
            val user = createTestUser("setup2fa@example.com", "setup2fa")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            mockMvc.perform(
                post("/auth/2fa/setup")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.qrCodeUrl").isNotEmpty)
                .andExpect(jsonPath("$.tempSecret").isNotEmpty)
        }

        @Test
        fun `should redirect when no token provided for 2fa setup`() {
            mockMvc.perform(post("/auth/2fa/setup"))
                .andExpect(status().is3xxRedirection)
        }
    }

    @Nested
    @DisplayName("POST /auth/2fa/enable")
    inner class EnableTwoFactor {

        @Test
        fun `should redirect when no token provided for 2fa enable`() {
            val request = TwoFactorSetupConfirmRequestDTO(code = "123456")

            mockMvc.perform(
                post("/auth/2fa/enable")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().is3xxRedirection)
        }

        @Test
        fun `should fail with invalid code`() {
            val user = createTestUser("enable2fa@example.com", "enable2fa")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            mockMvc.perform(
                post("/auth/2fa/setup")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)

            val request = TwoFactorSetupConfirmRequestDTO(code = "000000")

            mockMvc.perform(
                post("/auth/2fa/enable")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid token"))
        }

        @Test
        fun `should fail when setup was not initiated`() {
            val user = createTestUser("noinit2fa@example.com", "noinit2fa")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            val request = TwoFactorSetupConfirmRequestDTO(code = "123456")

            mockMvc.perform(
                post("/auth/2fa/enable")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.success").value(false))
        }
    }

    @Nested
    @DisplayName("POST /auth/2fa/disable")
    inner class DisableTwoFactor {

        @Test
        fun `should redirect when no token provided for 2fa disable`() {
            val request = TwoFactorDisableRequestDTO(password = "password123", code = "123456")

            mockMvc.perform(
                post("/auth/2fa/disable")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().is3xxRedirection)
        }

        @Test
        fun `should fail when 2FA is not enabled`() {
            val user = createTestUser("disable2fa@example.com", "disable2fa")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            val request = TwoFactorDisableRequestDTO(password = "password123", code = "123456")

            mockMvc.perform(
                post("/auth/2fa/disable")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("2FA is not enabled"))
        }

        @Test
        fun `should fail with wrong password`() {
            val user = createTestUser(
                "wrongpw@example.com", "wrongpw",
                twoFactorEnabled = true,
                twoFactorSecret = "JBSWY3DPEHPK3PXP"
            )
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            val request = TwoFactorDisableRequestDTO(password = "wrongpassword", code = "123456")

            mockMvc.perform(
                post("/auth/2fa/disable")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid password"))
        }
    }

    @Nested
    @DisplayName("POST /auth/verify-2fa")
    inner class VerifyTwoFactor {

        @Test
        fun `should redirect when calling verify-2fa without auth`() {
            val request = TwoFactorLoginRequestDTO(
                twoFactorToken = "invalid.token",
                code = "123456"
            )

            mockMvc.perform(
                post("/auth/verify-2fa")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().is3xxRedirection)
        }

        @Test
        fun `should fail with access token instead of 2FA challenge token`() {
            val user = createTestUser(
                "verify2fa@example.com", "verify2fa",
                twoFactorEnabled = true,
                twoFactorSecret = "JBSWY3DPEHPK3PXP"
            )
            val accessToken = jwtTokenGenerator.generateToken(user.id!!, user.email)

            val request = TwoFactorLoginRequestDTO(
                twoFactorToken = accessToken,
                code = "123456"
            )

            mockMvc.perform(
                post("/auth/verify-2fa")
                    .header("Authorization", "Bearer $accessToken")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isUnauthorized)
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid 2FA token"))
        }

        @Test
        fun `should fail with valid challenge token but wrong code`() {
            val user = createTestUser(
                "wrongcode@example.com", "wrongcode",
                twoFactorEnabled = true,
                twoFactorSecret = "JBSWY3DPEHPK3PXP"
            )
            val accessToken = jwtTokenGenerator.generateToken(user.id!!, user.email)
            val challengeToken = jwtTokenGenerator.generateTwoFactorChallengeToken(user.id!!, user.email)

            val request = TwoFactorLoginRequestDTO(
                twoFactorToken = challengeToken,
                code = "000000"
            )

            mockMvc.perform(
                post("/auth/verify-2fa")
                    .header("Authorization", "Bearer $accessToken")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isUnauthorized)
                .andExpect(jsonPath("$.success").value(false))
        }
    }

    private fun createTestUser(
        email: String,
        nickname: String,
        twoFactorEnabled: Boolean = false,
        twoFactorSecret: String? = null
    ): User {
        val user = User(
            nickname = nickname,
            name = "Test User",
            email = email,
            username = nickname,
            passwordHash = passwordEncoder.encode("password123"),
            profilePic = 0,
            twoFactorEnabled = twoFactorEnabled,
            twoFactorSecretEncrypted = twoFactorSecret
        )
        return userRepository.save(user)
    }
}
