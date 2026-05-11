package com.transcendence.demo.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.transcendence.demo.entity.Match
import com.transcendence.demo.repository.MatchRepository
import com.transcendence.demo.repository.MapRepository
import com.transcendence.demo.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class MatchService(
    private val matchRepository: MatchRepository,
    private val mapRepository: MapRepository,
    private val userRepository: UserRepository,
    private val objectMapper: ObjectMapper
) {

    @Transactional
    fun createMatch(
        userId: Long,
        mapId: Long,
        score: Int? = null,
        durationSeconds: Int? = null,
        metadata: Map<String, Any>? = null
    ): Match {
        if (userId <= 0) {
            throw IllegalArgumentException("Invalid user id")
        }
        if (mapId <= 0) {
            throw IllegalArgumentException("Invalid map id")
        }

        val user = userRepository.findById(userId).orElse(null)
            ?: throw NoSuchElementException("User not found")

        val map = mapRepository.findById(mapId).orElse(null)
            ?: throw NoSuchElementException("Map not found")

        val metadataJson = metadata?.let { objectMapper.writeValueAsString(it) }

        val match = Match(
            user = user,
            map = map,
            score = score,
            durationSeconds = durationSeconds,
            metadata = metadataJson
        )

        return matchRepository.save(match)
    }
}
