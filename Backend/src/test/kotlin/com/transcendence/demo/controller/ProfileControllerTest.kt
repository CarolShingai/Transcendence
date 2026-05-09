package com.transcendence.demo.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.transcendence.demo.DTO.Request.ProfileUpdateRequestDTO
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ProfileControllerTest {

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
    @DisplayName("PATCH /profile/me")
    inner class UpdateProfile {

        @Test
        fun `should update name successfully`() {
            val user = createTestUser("profile@example.com", "profileuser")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            val request = ProfileUpdateRequestDTO(name = "Updated Name")

            mockMvc.perform(
                patch("/profile/me")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.user.name").value("Updated Name"))
        }

        @Test
        fun `should update nickname successfully`() {
            val user = createTestUser("nick@example.com", "oldnick")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            val request = ProfileUpdateRequestDTO(nickname = "newnick")

            mockMvc.perform(
                patch("/profile/me")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.user.nickname").value("newnick"))
        }

        @Test
        fun `should update profile picture successfully`() {
            val user = createTestUser("pic@example.com", "picuser")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            val request = ProfileUpdateRequestDTO(profilePic = 5)

            mockMvc.perform(
                patch("/profile/me")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.user.profilePic").value(5))
        }

        @Test
        fun `should fail when nickname is already taken`() {
            createTestUser("other@example.com", "takennick")
            val user = createTestUser("myprofile@example.com", "mynick")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            val request = ProfileUpdateRequestDTO(nickname = "takennick")

            mockMvc.perform(
                patch("/profile/me")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
        }

        @Test
        fun `should fail when name is blank`() {
            val user = createTestUser("blank@example.com", "blankname")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            val request = ProfileUpdateRequestDTO(name = "   ")

            mockMvc.perform(
                patch("/profile/me")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
        }

        @Test
        fun `should fail with invalid profile picture index`() {
            val user = createTestUser("invalid@example.com", "invalidpic")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            val request = ProfileUpdateRequestDTO(profilePic = 99)

            mockMvc.perform(
                patch("/profile/me")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
        }

        @Test
        fun `should redirect when no token provided for profile update`() {
            val request = ProfileUpdateRequestDTO(name = "New Name")

            mockMvc.perform(
                patch("/profile/me")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().is3xxRedirection)
        }
    }

    private fun createTestUser(email: String, nickname: String): User {
        val user = User(
            nickname = nickname,
            name = "Test User",
            email = email,
            username = nickname,
            passwordHash = passwordEncoder.encode("password123"),
            profilePic = 0
        )
        return userRepository.save(user)
    }
}
