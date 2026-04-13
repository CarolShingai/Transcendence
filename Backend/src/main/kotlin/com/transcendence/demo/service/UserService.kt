package com.transcendence.demo.service

import com.transcendence.demo.dto.UserResponse
import com.transcendence.demo.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository
) {
    fun findAll(): List<UserResponse> {
        return userRepository.findAll().map { user ->
            UserResponse(
                id = user.id ?: 0,
                nickname = user.nickname,
                name = user.name,
                email = user.email
            )
        }
    }
}
