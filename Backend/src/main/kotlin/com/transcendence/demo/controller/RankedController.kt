package com.transcendence.demo.controller

import com.transcendence.demo.service.MatchService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = ["/ranked", "/api/ranked"])
class RankedController(
    private val matchService: MatchService
) {

    @GetMapping
    fun listRankedPlayers(): ResponseEntity<Any> {
        val rankedPlayers = matchService.listRankedPlayers()
        return ResponseEntity.ok(mapOf("players" to rankedPlayers))
    }
}