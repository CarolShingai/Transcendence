package com.transcendence.demo.config

import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class MapSeeder(
    private val jdbcTemplate: JdbcTemplate
) : CommandLineRunner {

    private val logger = LoggerFactory.getLogger(MapSeeder::class.java)

    override fun run(vararg args: String) {
        val maps = listOf(
            1L to "AMAZONAS",
            2L to "CERRADO",
            3L to "MATA ATLÂNTICA",
            4L to "SAVANA"
        )

        maps.forEach { (id, name) ->
            jdbcTemplate.update(
                "INSERT IGNORE INTO maps (id, name) VALUES (?, ?)",
                id,
                name
            )
        }

        logger.info("MapSeeder ensured {} maps are present", maps.size)
    }
}