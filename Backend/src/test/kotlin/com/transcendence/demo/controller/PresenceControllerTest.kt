package com.transcendence.demo.controller

import com.transcendence.demo.entity.User
import com.transcendence.demo.providers.JwtTokenGenerator
import com.transcendence.demo.repository.UserRepository
import com.transcendence.demo.websocket.PresenceService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PresenceControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var presenceService: PresenceService

    @Autowired
    private lateinit var jwtTokenGenerator: JwtTokenGenerator

    private val passwordEncoder = BCryptPasswordEncoder()

    @BeforeEach
    fun setup() {
        userRepository.deleteAll()
    }

    @Nested
    @DisplayName("GET /presence/online-users")
    inner class OnlineUsers {

        @Test
        fun `should return empty list when no users are online`() {
            val user = createTestUser("auth@example.com", "authuser")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            mockMvc.perform(
                get("/presence/online-users")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.onlineUsers").isArray)
                .andExpect(jsonPath("$.count").value(0))
        }

        @Test
        fun `should return online users after connection`() {
            val user = createTestUser("online@example.com", "onlineuser")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)
            presenceService.registerConnection(user, "test-session-1")

            mockMvc.perform(
                get("/presence/online-users")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.onlineUsers").isArray)
                .andExpect(jsonPath("$.count").value(1))
                .andExpect(jsonPath("$.onlineUsers[0].nickname").value("onlineuser"))

            presenceService.unregisterConnection("test-session-1")
        }

        @Test
        fun `should not return user after disconnection`() {
            val user = createTestUser("offline@example.com", "offlineuser")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)
            presenceService.registerConnection(user, "test-session-2")
            presenceService.unregisterConnection("test-session-2")

            mockMvc.perform(
                get("/presence/online-users")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.count").value(0))
        }

        @Test
        fun `should redirect when no token provided for presence`() {
            mockMvc.perform(get("/presence/online-users"))
                .andExpect(status().is3xxRedirection)
        }
    }

    private fun createTestUser(email: String, nickname: String): User {
        val user = User(
            nickname = nickname,
            name = "Test $nickname",
            email = email,
            username = nickname,
            passwordHash = passwordEncoder.encode("password123"),
            profilePic = 0
        )
        return userRepository.save(user)
    }
}
