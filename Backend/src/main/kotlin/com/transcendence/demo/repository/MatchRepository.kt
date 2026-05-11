package com.transcendence.demo.repository

import com.transcendence.demo.entity.Match
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface MatchRepository : JpaRepository<Match, Long> {
	fun findByClientMatchId(clientMatchId: String): Match?
	fun findAllByUser_IdOrderByCreatedAtDesc(userId: Long): List<Match>

	interface RankedPlayerProjection {
		val userId: Long
		val nickname: String
		val bestScore: Int
	}

	@Query(
		value = """
			SELECT
				u.id AS userId,
				u.nickname AS nickname,
				COALESCE(MAX(COALESCE(m.score, 0)), 0) AS bestScore
			FROM matches m
			INNER JOIN users u ON u.id = m.user_id
			WHERE m.map_id = 3
			GROUP BY u.id, u.nickname
			ORDER BY bestScore DESC, u.nickname ASC
		""",
		nativeQuery = true
	)
	fun findRankedPhaseThreePlayers(): List<RankedPlayerProjection>
}
