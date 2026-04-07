package com.transcendence.demo.controller

import com.transcendence.demo.DTO.RegisterRequestDTO
import com.transcendence.demo.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/auth")
class AuthController(private val userService: UserService) {

    // @PostMapping("/register")
    // fun registerUser(@RequestBody request: RegisterRequestDTO): ResponseEntity<String> {
    //     val (success, message) = userService.registerUser(request)
    //     return if (success) {
    //         userService.createUser(request)
    //         ResponseEntity.ok(message)
    //     } else {
    //         ResponseEntity.badRequest().body(message)
    //     }
    // }
    @PostMapping("/register")
    fun registerUser(@RequestBody request: RegisterRequestDTO): ResponseEntity<String> {
        val (success, message) = userService.registerUser(request)
        return if (success) {
            userService.createUser(request)
            ResponseEntity.status(HttpStatus.CREATED).body(message)
        } else {
            ResponseEntity.badRequest().body(message)
        }
    }
}
