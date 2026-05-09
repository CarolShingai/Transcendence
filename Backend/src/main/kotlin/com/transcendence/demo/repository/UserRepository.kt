package com.transcendence.demo.repository

import com.transcendence.demo.entity.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, Long> {
    fun findByNickname(nickname: String): User?

    fun findByUsername(username: String): User?

    fun findByEmail(email: String): User?

    fun findByNameContainingIgnoreCaseOrNicknameContainingIgnoreCase(name: String, nickname: String): List<User>
}


