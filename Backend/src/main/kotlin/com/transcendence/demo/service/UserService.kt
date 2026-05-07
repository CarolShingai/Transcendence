package com.transcendence.demo.service

import com.transcendence.demo.DTO.Request.RegisterRequestDTO
import com.transcendence.demo.DTO.Request.ProfileUpdateRequestDTO
import com.transcendence.demo.DTO.Request.TwoFactorDisableRequestDTO
import com.transcendence.demo.DTO.Request.TwoFactorSetupConfirmRequestDTO
import com.transcendence.demo.DTO.Response.LoginResponseDTO
import com.transcendence.demo.DTO.Response.TwoFactorDisableResponseDTO
import com.transcendence.demo.DTO.Response.TwoFactorEnableResponseDTO
import com.transcendence.demo.DTO.Response.TwoFactorSetupResponseDTO
import com.transcendence.demo.DTO.Response.UserResponseDTO
import com.transcendence.demo.entity.User
import com.transcendence.demo.providers.JwtTokenGenerator
import com.transcendence.demo.repository.UserRepository
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.UUID

@Service
class UserService(
    private val userRepository: UserRepository,
    private val jwtTokenGenerator: JwtTokenGenerator,
    private val twoFactorService: TwoFactorService
) {

    companion object {
        private const val MIN_PROFILE_PIC_INDEX = 0
        private const val MAX_PROFILE_PIC_INDEX = 15
    }

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
            profilePic = request.profilePic.coerceIn(MIN_PROFILE_PIC_INDEX, MAX_PROFILE_PIC_INDEX)
        )
        return userRepository.save(user)
    }

    fun updateProfile(email: String, request: ProfileUpdateRequestDTO): UserResponseDTO {
        val user = userRepository.findByEmail(email)
            ?: throw NoSuchElementException("User not found")

        request.name?.let { value ->
            val normalizedName = value.trim()
            if (normalizedName.isBlank()) {
                throw IllegalArgumentException("Name cannot be blank")
            }
            user.name = normalizedName
        }

        request.nickname?.let { value ->
            val normalizedNickname = value.trim()
            if (normalizedNickname.isBlank()) {
                throw IllegalArgumentException("Nickname cannot be blank")
            }

            val nicknameOwner = userRepository.findByNickname(normalizedNickname)
            if (nicknameOwner != null && nicknameOwner.id != user.id) {
                throw IllegalArgumentException("Nickname already exists")
            }

            val usernameOwner = userRepository.findByUsername(normalizedNickname)
            if (usernameOwner != null && usernameOwner.id != user.id) {
                throw IllegalArgumentException("Username already exists")
            }

            user.nickname = normalizedNickname
            user.username = normalizedNickname
        }

        request.profilePic?.let { value ->
            if (value !in MIN_PROFILE_PIC_INDEX..MAX_PROFILE_PIC_INDEX) {
                throw IllegalArgumentException("Profile picture must be between $MIN_PROFILE_PIC_INDEX and $MAX_PROFILE_PIC_INDEX")
            }
            user.profilePic = value
        }

        return userRepository.save(user).toUserResponseDto()
    }

    fun loginUser(email: String, password: String): LoginResponseDTO {

        val user = userRepository.findByEmail(email)
        return if (user != null && passwordEncoder.matches(password, user.passwordHash)) {
            if (user.twoFactorEnabled) {
                // Generate temporary JWT for 2FA verification
                val tempToken = jwtTokenGenerator.generateTwoFactorChallengeToken(user.id!!, user.email)
                LoginResponseDTO(
                    success = true,
                    message = "2FA required",
                    twoFactorToken = tempToken,
                    requiresTwoFactor = true,
                    user = user.toUserResponseDto()
                )
            } else {
                val token = jwtTokenGenerator.generateToken(user.id!!, user.email)
                LoginResponseDTO(
                    success = true,
                    message = "Login successful",
                    token = token,
                    user = user.toUserResponseDto()
                )
            }
        } else {
            LoginResponseDTO(success = false, message = "Invalid email or password")
        }
    }

    fun loginWithTwoFactor(userId: Long, token: String): LoginResponseDTO {
        val user = userRepository.findById(userId).orElse(null)
            ?: return LoginResponseDTO(success = false, message = "User not found")

        if (!user.twoFactorEnabled) {
            return LoginResponseDTO(success = false, message = "2FA is not enabled")
        }

        val secret = user.twoFactorSecretEncrypted
            ?: return LoginResponseDTO(success = false, message = "2FA secret not found")

        if (!twoFactorService.verifyToken(token, secret)) {
            return LoginResponseDTO(success = false, message = "Invalid 2FA token")
        }

        val finalToken = jwtTokenGenerator.generateToken(user.id!!, user.email)
        return LoginResponseDTO(
            success = true,
            message = "Login successful",
            token = finalToken,
            user = user.toUserResponseDto()
        )
    }

    fun setupTwoFactor(userId: Long): TwoFactorSetupResponseDTO {
        val user = userRepository.findById(userId).orElse(null)
            ?: throw IllegalArgumentException("User not found")

        if (user.twoFactorEnabled) {
            throw IllegalArgumentException("2FA is already enabled")
        }

        val tempSecret = twoFactorService.generateTempSecret()
    user.twoFactorSecretEncrypted = tempSecret
    user.twoFactorConfirmedAt = null
        userRepository.save(user)

        val qrCodeUrl = twoFactorService.generateQrCodeUrl(user.email, tempSecret)

        return TwoFactorSetupResponseDTO(
            qrCodeUrl = qrCodeUrl,
            tempSecret = tempSecret
        )
    }

    fun enableTwoFactor(userId: Long, request: TwoFactorSetupConfirmRequestDTO): TwoFactorEnableResponseDTO {
        val user = userRepository.findById(userId).orElse(null)
            ?: return TwoFactorEnableResponseDTO(
                success = false,
                message = "User not found"
            )

        if (user.twoFactorEnabled) {
            return TwoFactorEnableResponseDTO(
                success = false,
                message = "2FA is already enabled"
            )
        }

        val tempSecret = user.twoFactorSecretEncrypted
            ?: return TwoFactorEnableResponseDTO(
                success = false,
                message = "2FA setup not initiated. Please call setup first."
            )

        if (!twoFactorService.verifyToken(request.code, tempSecret)) {
            return TwoFactorEnableResponseDTO(
                success = false,
                message = "Invalid token"
            )
        }

        user.twoFactorEnabled = true
        user.twoFactorConfirmedAt = LocalDateTime.now()
        userRepository.save(user)

        return TwoFactorEnableResponseDTO(
            success = true,
            message = "2FA enabled successfully"
        )
    }

    fun disableTwoFactor(userId: Long, request: TwoFactorDisableRequestDTO): TwoFactorDisableResponseDTO {
        val user = userRepository.findById(userId).orElse(null)
            ?: return TwoFactorDisableResponseDTO(
                success = false,
                message = "User not found"
            )

        if (!user.twoFactorEnabled) {
            return TwoFactorDisableResponseDTO(
                success = false,
                message = "2FA is not enabled"
            )
        }

        val secret = user.twoFactorSecretEncrypted
            ?: return TwoFactorDisableResponseDTO(
                success = false,
                message = "2FA secret not found"
            )

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            return TwoFactorDisableResponseDTO(
                success = false,
                message = "Invalid password"
            )
        }

        if (!twoFactorService.verifyToken(request.code, secret)) {
            return TwoFactorDisableResponseDTO(
                success = false,
                message = "Invalid token"
            )
        }

        user.twoFactorEnabled = false
        user.twoFactorSecretEncrypted = null
        user.twoFactorConfirmedAt = null
        userRepository.save(user)

        return TwoFactorDisableResponseDTO(
            success = true,
            message = "2FA disabled successfully"
        )
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
            user = user.toUserResponseDto()
        )
    }

    fun getUserProfileByEmail(email: String): UserResponseDTO? {
        val user = userRepository.findByEmail(email) ?: return null
        return user.toUserResponseDto()
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

    private fun User.toUserResponseDto(): UserResponseDTO {
        return UserResponseDTO(
            id = id,
            nickname = nickname,
            name = name,
            email = email,
            profilePic = profilePic
        )
    }
}
