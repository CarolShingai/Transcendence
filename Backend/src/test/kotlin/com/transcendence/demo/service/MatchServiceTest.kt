package com.transcendence.demo.service

import com.transcendence.demo.entity.MapEntity
import com.transcendence.demo.entity.User
import com.transcendence.demo.repository.MatchRepository
import com.transcendence.demo.repository.MapRepository
import com.transcendence.demo.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MatchServiceTest {

    @Autowired
    private lateinit var matchService: MatchService

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var mapRepository: MapRepository

    @Autowired
    private lateinit var matchRepository: MatchRepository

    private val passwordEncoder = BCryptPasswordEncoder()

    @BeforeEach
    fun setup() {
        matchRepository.deleteAll()
        mapRepository.deleteAll()
        userRepository.deleteAll()
    }

    @Nested
    @DisplayName("createMatch")
    inner class CreateMatch {

        @Test
        fun `should create a match when user and map exist`() {
            val user = createTestUser("player@example.com", "player")
            val map = createTestMap("Amazonas")

            val result = matchService.createMatch(
                userId = user.id!!,
                mapId = map.id!!,
                score = 42,
                durationSeconds = 180,
                metadata = mapOf("mode" to "ranked", "winner" to true),
                clientMatchId = "match-abc-123"
            )

            assertTrue(result.created)
            assertEquals(user.id, result.match.user.id)
            assertEquals(map.id, result.match.map.id)
            assertEquals(42, result.match.score)
            assertEquals(180, result.match.durationSeconds)
        }

        @Test
        fun `should return the same match when client id is repeated`() {
            val user = createTestUser("repeat@example.com", "repeat")
            val map = createTestMap("Cerrado")

            val first = matchService.createMatch(
                userId = user.id!!,
                mapId = map.id!!,
                score = 10,
                durationSeconds = 60,
                metadata = mapOf("mode" to "single"),
                clientMatchId = "repeat-001"
            )

            val second = matchService.createMatch(
                userId = user.id!!,
                mapId = map.id!!,
                score = 999,
                durationSeconds = 999,
                metadata = mapOf("mode" to "single"),
                clientMatchId = "repeat-001"
            )

            assertTrue(first.created)
            assertFalse(second.created)
            assertEquals(first.match.id, second.match.id)
            assertEquals(1, matchRepository.count())
        }

        @Test
        fun `should fail when map does not exist`() {
            val user = createTestUser("player2@example.com", "player2")

            assertThrows(NoSuchElementException::class.java) {
                matchService.createMatch(
                    userId = user.id!!,
                    mapId = 9999,
                    score = 10,
                    durationSeconds = 60,
                    metadata = null
                )
            }
        }

        @Test
        fun `should fail when user does not exist`() {
            val map = createTestMap("Cerrado")

            assertThrows(NoSuchElementException::class.java) {
                matchService.createMatch(
                    userId = 9999,
                    mapId = map.id!!,
                    score = 10,
                    durationSeconds = 60,
                    metadata = null
                )
            }
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
