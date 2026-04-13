package com.transcendence.demo.controller

import com.transcendence.demo.dto.UserResponse
import com.transcendence.demo.service.UserService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService
) {
    @GetMapping
    fun listUsers(): List<UserResponse> = userService.findAll()
}
