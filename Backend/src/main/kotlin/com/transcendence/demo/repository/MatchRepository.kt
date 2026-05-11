package com.transcendence.demo.repository

import com.transcendence.demo.entity.Match
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MatchRepository : JpaRepository<Match, Long> {
	fun findByClientMatchId(clientMatchId: String): Match?
}
