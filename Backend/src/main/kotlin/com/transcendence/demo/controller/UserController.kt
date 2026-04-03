package com.transcendence.demo.controller

import com.transcendence.demo.DTO.RegisterRequestDTO
import com.transcendence.demo.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/users")
class UserController(private val userService: UserService) {

    @PostMapping("/UserRegister")
    fun registerUser(@RequestBody request: RegisterRequestDTO): ResponseEntity<String> {
        val (success, message) = userService.registerUser(request)
        return if (success) {
            userService.createUser(request)
            ResponseEntity.ok(message)
        } else {
            ResponseEntity.badRequest().body(message)
        }
    }
}
