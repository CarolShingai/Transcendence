package com.transcendence.demo.service

import com.transcendence.demo.DTO.Request.RegisterRequestDTO
import com.transcendence.demo.DTO.Response.LoginResponseDTO
import com.transcendence.demo.DTO.Response.UserResponseDTO
import com.transcendence.demo.entity.User
import com.transcendence.demo.providers.JwtTokenGenerator
import com.transcendence.demo.repository.UserRepository
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserService(
    private val userRepository: UserRepository,
    private val jwtTokenGenerator: JwtTokenGenerator
) {

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

    fun loginUser(email: String, password: String): LoginResponseDTO {

        val user = userRepository.findByEmail(email)
        return if (user != null && passwordEncoder.matches(password, user.passwordHash)) {
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)
            LoginResponseDTO(
                success = true,
                message = "Login successful",
                token = token,
                user = UserResponseDTO(
                    id = user.id,
                    nickname = user.nickname,
                    name = user.name,
                    email = user.email
                )
            )
        } else {
            LoginResponseDTO(success = false, message = "Invalid email or password")
        }
    }

    fun loginOrCreateGoogleUser(email: String, name: String?): LoginResponseDTO {
        if (email.isBlank() || !isValidEmail(email)) {
            return LoginResponseDTO(success = false, message = "Invalid Google account email")
        }

        val user = userRepository.findByEmail(email) ?: createGoogleUser(email, name)
        val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

        return LoginResponseDTO(
            success = true,
            message = "Google login successful",
            token = token,
            user = UserResponseDTO(
                id = user.id,
                nickname = user.nickname,
                name = user.name,
                email = user.email
            )
        )
    }

    private fun createGoogleUser(email: String, name: String?): User {
        val displayName = if (name.isNullOrBlank()) email.substringBefore("@") else name
        val baseNickname = email.substringBefore("@").ifBlank { "user" }
        val uniqueNickname = generateUniqueNickname(baseNickname)

        val randomPassword = UUID.randomUUID().toString()
        val encodedPassword = passwordEncoder.encode(randomPassword)

        val user = User(
            nickname = uniqueNickname,
            username = uniqueNickname,
            name = displayName,
            email = email,
            passwordHash = encodedPassword,
            criptpass = encodedPassword,
            active = true
        )

        return userRepository.save(user)
    }

    private fun generateUniqueNickname(base: String): String {
        var candidate = base.lowercase().replace(" ", "")
        if (candidate.isBlank()) candidate = "user"

        if (userRepository.findByNickname(candidate) == null && userRepository.findByUsername(candidate) == null) {
            return candidate
        }

        var suffix = 1
        while (true) {
            val next = "$candidate$suffix"
            if (userRepository.findByNickname(next) == null && userRepository.findByUsername(next) == null) {
                return next
            }
            suffix++
        }
    }

    /**
     * Valida formato de email simples
     */
    private fun isValidEmail(email: String): Boolean {
        return email.contains("@") && email.contains(".")
    }
}
