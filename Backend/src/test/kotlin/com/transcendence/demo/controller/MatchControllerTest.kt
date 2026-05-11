package com.transcendence.demo.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.transcendence.demo.DTO.Request.CreateMatchRequestDTO
import com.transcendence.demo.entity.MapEntity
import com.transcendence.demo.entity.User
import com.transcendence.demo.providers.JwtTokenGenerator
import com.transcendence.demo.repository.MapRepository
import com.transcendence.demo.repository.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
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
class MatchControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    private val objectMapper: ObjectMapper = jacksonObjectMapper()

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var mapRepository: MapRepository

    @Autowired
    private lateinit var jwtTokenGenerator: JwtTokenGenerator

    private val passwordEncoder = BCryptPasswordEncoder()

    @BeforeEach
    fun setup() {
        mapRepository.deleteAll()
        userRepository.deleteAll()
    }

    @Nested
    @DisplayName("POST /api/matches")
    inner class CreateMatch {

        @Test
        fun `should register a match successfully when authenticated`() {
            val user = createTestUser("match@example.com", "matchplayer")
            val map = createTestMap("Amazonas")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)
            val request = CreateMatchRequestDTO(
                mapId = map.id!!,
                score = 120,
                durationSeconds = 240,
                metadata = mapOf("mode" to "ranked")
            )

            mockMvc.perform(
                post("/api/matches")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isCreated)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Match registered successfully"))
                .andExpect(jsonPath("$.matchId").isNumber)
                .andExpect(jsonPath("$.userId").value(user.id!!.toInt()))
                .andExpect(jsonPath("$.mapId").value(map.id!!.toInt()))
        }

        @Test
        fun `should return not found when map does not exist`() {
            val user = createTestUser("missingmap@example.com", "missingmap")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)
            val request = CreateMatchRequestDTO(
                mapId = 9999,
                score = 10,
                durationSeconds = 60,
                metadata = null
            )

            mockMvc.perform(
                post("/api/matches")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isNotFound)
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Map not found"))
        }

        @Test
        fun `should redirect when no token provided`() {
            val map = createTestMap("Cerrado")
            val request = CreateMatchRequestDTO(
                mapId = map.id!!,
                score = 10,
                durationSeconds = 60,
                metadata = null
            )

            mockMvc.perform(
                post("/api/matches")
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

    private fun createTestMap(name: String): MapEntity {
        return mapRepository.save(MapEntity(name = name))
    }
}
