package com.transcendence.demo.service

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.transcendence.demo.DTO.Response.MatchHistoryItemResponseDTO
import com.transcendence.demo.entity.Match
import com.transcendence.demo.repository.MatchRepository
import com.transcendence.demo.repository.MapRepository
import com.transcendence.demo.repository.UserRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class MatchService(
    private val matchRepository: MatchRepository,
    private val mapRepository: MapRepository,
    private val userRepository: UserRepository
) {
    private val objectMapper = jacksonObjectMapper()

    data class MatchCreationResult(
        val match: Match,
        val created: Boolean
    )

    @Transactional(readOnly = true)
    fun listMatchesForUser(userId: Long): List<MatchHistoryItemResponseDTO> {
        if (userId <= 0) {
            throw IllegalArgumentException("Invalid user id")
        }

        return matchRepository.findAllByUser_IdOrderByCreatedAtDesc(userId).map { match ->
            MatchHistoryItemResponseDTO(
                id = match.id ?: 0L,
                createdAt = match.createdAt ?: throw IllegalStateException("Match createdAt is missing"),
                mapId = match.map.id ?: 0L,
                mapName = match.map.name,
                score = match.score,
                durationSeconds = match.durationSeconds
            )
        }
    }

    @Transactional
    fun createMatch(
        userId: Long,
        mapId: Long,
        score: Int? = null,
        durationSeconds: Int? = null,
        metadata: Map<String, Any>? = null,
        clientMatchId: String? = null
    ): MatchCreationResult {
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

        val normalizedClientMatchId = clientMatchId?.trim()?.takeIf { it.isNotBlank() }
        if (!normalizedClientMatchId.isNullOrBlank()) {
            val existing = matchRepository.findByClientMatchId(normalizedClientMatchId)
            if (existing != null) {
                return MatchCreationResult(existing, created = false)
            }
        }

        val metadataJson = metadata?.let { objectMapper.writeValueAsString(it) }

        val match = Match(
            user = user,
            map = map,
            score = score,
            durationSeconds = durationSeconds,
            clientMatchId = normalizedClientMatchId,
            metadata = metadataJson
        )

        return try {
            MatchCreationResult(matchRepository.save(match), created = true)
        } catch (e: DataIntegrityViolationException) {
            if (normalizedClientMatchId.isNullOrBlank()) {
                throw e
            }

            val existing = matchRepository.findByClientMatchId(normalizedClientMatchId)
                ?: throw e

            MatchCreationResult(existing, created = false)
        }
    }
}
