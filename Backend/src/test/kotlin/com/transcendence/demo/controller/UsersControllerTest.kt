package com.transcendence.demo.controller

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
class UsersControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

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
    @DisplayName("GET /users")
    inner class ListUsers {

        @Test
        fun `should list all users when authenticated`() {
            val user1 = createTestUser("user1@example.com", "user1", "User One")
            createTestUser("user2@example.com", "user2", "User Two")

            val token = jwtTokenGenerator.generateToken(user1.id!!, user1.email)

            mockMvc.perform(
                get("/users")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.users").isArray)
                .andExpect(jsonPath("$.users.length()").value(2))
        }

        @Test
        fun `should return empty list when no users exist`() {
            val user = createTestUser("solo@example.com", "solo", "Solo User")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            mockMvc.perform(
                get("/users")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.users").isArray)
                .andExpect(jsonPath("$.users.length()").value(1))
        }

        @Test
        fun `should redirect when no token provided for users`() {
            mockMvc.perform(get("/users"))
                .andExpect(status().is3xxRedirection)
        }
    }

    @Nested
    @DisplayName("GET /users/search")
    inner class SearchUsers {

        @Test
        fun `should find users by name`() {
            val requester = createTestUser("requester@example.com", "requester", "Requester")
            createTestUser("alice@example.com", "alice", "Alice Wonderland")
            createTestUser("bob@example.com", "bob", "Bob Builder")

            val token = jwtTokenGenerator.generateToken(requester.id!!, requester.email)

            mockMvc.perform(
                get("/users/search")
                    .param("q", "Alice")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.users").isArray)
                .andExpect(jsonPath("$.users.length()").value(1))
                .andExpect(jsonPath("$.users[0].name").value("Alice Wonderland"))
        }

        @Test
        fun `should find users by nickname`() {
            val requester = createTestUser("requester@example.com", "requester", "Requester")
            createTestUser("search@example.com", "searchable", "Searchable User")

            val token = jwtTokenGenerator.generateToken(requester.id!!, requester.email)

            mockMvc.perform(
                get("/users/search")
                    .param("q", "searchable")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.users").isArray)
                .andExpect(jsonPath("$.users.length()").value(1))
        }

        @Test
        fun `should not return requester in search results`() {
            val requester = createTestUser("self@example.com", "selfuser", "Self User")
            val token = jwtTokenGenerator.generateToken(requester.id!!, requester.email)

            mockMvc.perform(
                get("/users/search")
                    .param("q", "Self")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.users").isArray)
                .andExpect(jsonPath("$.users.length()").value(0))
        }

        @Test
        fun `should return empty list for blank query`() {
            val requester = createTestUser("blank@example.com", "blankquery", "Blank Query")
            val token = jwtTokenGenerator.generateToken(requester.id!!, requester.email)

            mockMvc.perform(
                get("/users/search")
                    .param("q", "   ")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.users").isArray)
                .andExpect(jsonPath("$.users.length()").value(0))
        }

        @Test
        fun `should redirect when no token provided for search`() {
            mockMvc.perform(
                get("/users/search")
                    .param("q", "test")
            )
                .andExpect(status().is3xxRedirection)
        }
    }

    private fun createTestUser(email: String, nickname: String, name: String = "Test User"): User {
        val user = User(
            nickname = nickname,
            name = name,
            email = email,
            username = nickname,
            passwordHash = passwordEncoder.encode("password123"),
            profilePic = 0
        )
        return userRepository.save(user)
    }
}
