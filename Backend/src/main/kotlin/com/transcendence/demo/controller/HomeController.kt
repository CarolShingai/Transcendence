package com.transcendence.demo.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class HomeController {

	@GetMapping("/")
	fun root(): ResponseEntity<Map<String, String>> {
		return ResponseEntity.ok(
			mapOf(
				"service" to "transcendence-backend",
				"status" to "ok"
			)
		)
	}

	@GetMapping("/health")
	fun health(): ResponseEntity<Map<String, String>> {
		return ResponseEntity.ok(
			mapOf(
				"status" to "ok"
			)
		)
	}
}