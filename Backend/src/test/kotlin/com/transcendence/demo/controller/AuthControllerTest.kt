package com.transcendence.demo.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.transcendence.demo.DTO.Request.LoginRequestDTO
import com.transcendence.demo.DTO.Request.RegisterRequestDTO
import com.transcendence.demo.entity.User
import com.transcendence.demo.providers.JwtTokenGenerator
import com.transcendence.demo.repository.UserRepository
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    private val objectMapper: ObjectMapper = jacksonObjectMapper()

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var jwtTokenGenerator: JwtTokenGenerator

    private val passwordEncoder = BCryptPasswordEncoder()

    @BeforeEach
    fun setup() {
        userRepository.deleteAll()
    }

    @Nested
    @DisplayName("POST /auth/register")
    inner class Register {

        @Test
        fun `should register a new user successfully`() {
            val request = RegisterRequestDTO(
                nickname = "testuser",
                name = "Test User",
                email = "test@example.com",
                password = "password123",
                profilePic = 1
            )

            mockMvc.perform(
                post("/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isCreated)
                .andExpect(jsonPath("$").value("User registered successfully"))
        }

        @Test
        fun `should fail when email is already registered`() {
            createTestUser("existing@example.com", "existinguser")

            val request = RegisterRequestDTO(
                nickname = "newuser",
                name = "New User",
                email = "existing@example.com",
                password = "password123",
                profilePic = 0
            )

            mockMvc.perform(
                post("/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$").value("Email already registered"))
        }

        @Test
        fun `should fail when nickname already exists`() {
            createTestUser("first@example.com", "takenname")

            val request = RegisterRequestDTO(
                nickname = "takenname",
                name = "Another User",
                email = "another@example.com",
                password = "password123",
                profilePic = 0
            )

            mockMvc.perform(
                post("/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$").value("Nickname already exists"))
        }

        @Test
        fun `should fail when required fields are blank`() {
            val request = RegisterRequestDTO(
                nickname = "",
                name = "",
                email = "",
                password = "",
                profilePic = 0
            )

            mockMvc.perform(
                post("/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$").value("All fields are required"))
        }

        @Test
        fun `should fail when email format is invalid`() {
            val request = RegisterRequestDTO(
                nickname = "validnick",
                name = "Valid Name",
                email = "invalidemail",
                password = "password123",
                profilePic = 0
            )

            mockMvc.perform(
                post("/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$").value("Invalid email format"))
        }
    }

    @Nested
    @DisplayName("POST /auth/login")
    inner class Login {

        @Test
        fun `should login successfully with correct credentials`() {
            createTestUser("login@example.com", "loginuser")

            val request = LoginRequestDTO(
                email = "login@example.com",
                password = "password123"
            )

            mockMvc.perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.token").isNotEmpty)
                .andExpect(jsonPath("$.user.email").value("login@example.com"))
        }

        @Test
        fun `should fail with wrong password`() {
            createTestUser("login@example.com", "loginuser")

            val request = LoginRequestDTO(
                email = "login@example.com",
                password = "wrongpassword"
            )

            mockMvc.perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isUnauthorized)
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email or password"))
        }

        @Test
        fun `should fail with non-existent email`() {
            val request = LoginRequestDTO(
                email = "nonexistent@example.com",
                password = "password123"
            )

            mockMvc.perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isUnauthorized)
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email or password"))
        }

        @Test
        fun `should return requiresTwoFactor when 2FA is enabled`() {
            createTestUser("2fa@example.com", "2fauser", twoFactorEnabled = true, twoFactorSecret = "JBSWY3DPEHPK3PXP")

            val request = LoginRequestDTO(
                email = "2fa@example.com",
                password = "password123"
            )

            mockMvc.perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.requiresTwoFactor").value(true))
                .andExpect(jsonPath("$.twoFactorToken").isNotEmpty)
                .andExpect(jsonPath("$.token").doesNotExist())
        }
    }

    @Nested
    @DisplayName("POST /auth/logout")
    inner class Logout {

        @Test
        fun `should logout successfully with valid token`() {
            val user = createTestUser("logout@example.com", "logoutuser")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            mockMvc.perform(
                post("/auth/logout")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Logout successful"))
        }

        @Test
        fun `should redirect when no token provided for logout`() {
            mockMvc.perform(post("/auth/logout"))
                .andExpect(status().is3xxRedirection)
        }
    }

    @Nested
    @DisplayName("GET /auth/me")
    inner class Me {

        @Test
        fun `should return authenticated user profile`() {
            val user = createTestUser("me@example.com", "meuser")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            mockMvc.perform(
                get("/auth/me")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.user.email").value("me@example.com"))
                .andExpect(jsonPath("$.user.nickname").value("meuser"))
        }

        @Test
        fun `should redirect when no token provided for me`() {
            mockMvc.perform(get("/auth/me"))
                .andExpect(status().is3xxRedirection)
        }

        @Test
        fun `should redirect with invalid token`() {
            mockMvc.perform(
                get("/auth/me")
                    .header("Authorization", "Bearer invalid.token.here")
            )
                .andExpect(status().is3xxRedirection)
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
