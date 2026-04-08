package com.transcendence.demo.service

import com.transcendence.demo.DTO.RegisterRequestDTO
import com.transcendence.demo.entity.User
import com.transcendence.demo.repository.UserRepository
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

@Service
class UserService(private val userRepository: UserRepository) {

    private val passwordEncoder = BCryptPasswordEncoder()

    /**
     * Registra um novo usuário com a senha criptografada
     */
    fun registerUser(request: RegisterRequestDTO): Pair<Boolean, String> {
        if (request.nickname.isBlank() || request.name.isBlank() || request.email.isBlank() || request.password.isBlank()) {
            return Pair(false, "All fields are required")
        }
        if (!isValidEmail(request.email)) {
            return Pair(false, "Invalid email format")
        }
        if (userRepository.findByNickname(request.nickname) != null) {
            return Pair(false, "Nickname already exists")
        }
        if (userRepository.findByUsername(request.nickname) != null) {
            return Pair(false, "Username already exists")
        }
        if (userRepository.findByEmail(request.email) != null) {
            return Pair(false, "Email already registered")
        }
        return Pair(true, "User registered successfully")
    }

    fun createUser(request: RegisterRequestDTO): User {
        val (isValid, message) = registerUser(request)
        if (!isValid) {
            throw IllegalArgumentException(message)
        }

        val encryptedPassword = passwordEncoder.encode(request.password)

        val user = User(
            nickname = request.nickname,
            name = request.name,
            email = request.email,
            username = request.nickname,
            passwordHash = encryptedPassword,
            criptpass = encryptedPassword
        )
        return userRepository.save(user)
    }

    /**
     * Valida formato de email simples
     */
    private fun isValidEmail(email: String): Boolean {
        return email.contains("@") && email.contains(".")
    }
}
