package com.transcendence.demo.service

import com.transcendence.demo.entity.User
import com.transcendence.demo.repository.UserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.io.ByteArrayOutputStream
import java.net.URLEncoder
import java.nio.ByteBuffer
import java.nio.charset.StandardCharsets
import java.security.SecureRandom
import java.security.MessageDigest
import javax.crypto.Mac
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

@Service
class TwoFactorService(
    private val userRepository: UserRepository
) {

    data class ProvisioningData(
        val secret: String,
        val otpauthUri: String,
        val qrCodeUrl: String
    )

    private val random = SecureRandom()

    @Value("\${twofactor.crypto-seed:}")
    private var cryptoSeed: String = ""

    @Value("\${jwt.secret}")
    private lateinit var jwtSecret: String

    fun createProvisioningData(
        accountName: String,
        issuer: String = DEFAULT_ISSUER,
        secretByteLength: Int = DEFAULT_SECRET_BYTES
    ): ProvisioningData {
        val secret = generateSecret(secretByteLength)
        val otpauthUri = buildOtpAuthUri(
            issuer = issuer,
            accountName = accountName,
            secret = secret
        )

        return ProvisioningData(
            secret = secret,
            otpauthUri = otpauthUri,
            qrCodeUrl = buildQrCodeUrl(otpauthUri)
        )
    }

    fun initializeUser(user: User, issuer: String = DEFAULT_ISSUER): ProvisioningData {
        val accountLabel = user.nickname
            .trim()
            .ifBlank { user.username.trim() }
            .ifBlank { "user-${user.id ?: "unknown"}" }

        val provisioningData = createProvisioningData(
            accountName = accountLabel,
            issuer = issuer
        )

        user.twoFactorSecretEncrypted = encryptSecret(provisioningData.secret)
        user.twoFactorEnabled = false
        user.twoFactorConfirmedAt = null
        userRepository.save(user)

        return provisioningData
    }

    fun confirmUser(user: User, code: String): Boolean {
        val secret = decryptSecret(user.twoFactorSecretEncrypted) ?: return false
        if (!verifyCode(secret, code)) {
            return false
        }

        user.twoFactorEnabled = true
        user.twoFactorConfirmedAt = java.time.LocalDateTime.now()
        userRepository.save(user)
        return true
    }

    fun disableUser(user: User, code: String): Boolean {
        val secret = decryptSecret(user.twoFactorSecretEncrypted)
            ?: return false

        if (!verifyCode(secret, code)) {
            return false
        }

        user.twoFactorEnabled = false
        user.twoFactorSecretEncrypted = null
        user.twoFactorConfirmedAt = null
        userRepository.save(user)
        return true
    }

    fun isCodeValidForUser(user: User, code: String): Boolean {
        val secret = decryptSecret(user.twoFactorSecretEncrypted) ?: return false
        return verifyCode(secret, code)
    }

    fun getStatus(user: User): Pair<Boolean, java.time.LocalDateTime?> {
        return user.twoFactorEnabled to user.twoFactorConfirmedAt
    }

    fun buildOtpAuthUri(
        issuer: String,
        accountName: String,
        secret: String,
        digits: Int = DEFAULT_DIGITS,
        periodSeconds: Int = DEFAULT_PERIOD_SECONDS
    ): String {
        val safeIssuer = issuer.trim().ifBlank { DEFAULT_ISSUER }
        val safeAccountName = accountName.trim()
        require(safeAccountName.isNotBlank()) { "accountName must not be blank" }

        val label = urlEncode("$safeIssuer:$safeAccountName")
        val encodedIssuer = urlEncode(safeIssuer)

        return "otpauth://totp/$label?secret=$secret&issuer=$encodedIssuer&algorithm=SHA1&digits=$digits&period=$periodSeconds"
    }

    fun buildQrCodeUrl(otpauthUri: String, size: Int = 320): String {
        val encoded = urlEncode(otpauthUri)
        return "https://api.qrserver.com/v1/create-qr-code/?size=${size}x$size&data=$encoded"
    }

    fun generateSecret(byteLength: Int = DEFAULT_SECRET_BYTES): String {
        require(byteLength > 0) { "byteLength must be positive" }
        val bytes = ByteArray(byteLength)
        random.nextBytes(bytes)
        return base32Encode(bytes)
    }

    fun verifyCode(
        secret: String,
        code: String,
        timeMillis: Long = System.currentTimeMillis(),
        window: Int = DEFAULT_WINDOW,
        digits: Int = DEFAULT_DIGITS,
        periodSeconds: Int = DEFAULT_PERIOD_SECONDS
    ): Boolean {
        val normalizedCode = code.trim()
        if (normalizedCode.isBlank() || !normalizedCode.all(Char::isDigit)) {
            return false
        }
        if (normalizedCode.length != digits) {
            return false
        }

        val secretBytes = try {
            base32Decode(secret)
        } catch (_: IllegalArgumentException) {
            return false
        }

        val counter = timeMillis / (periodSeconds * 1000L)
        for (offset in -window..window) {
            val expected = generateCode(secretBytes, counter + offset, digits)
            if (expected == normalizedCode) {
                return true
            }
        }

        return false
    }

    fun generateCurrentCode(
        secret: String,
        timeMillis: Long = System.currentTimeMillis(),
        digits: Int = DEFAULT_DIGITS,
        periodSeconds: Int = DEFAULT_PERIOD_SECONDS
    ): String {
        val secretBytes = base32Decode(secret)
        val counter = timeMillis / (periodSeconds * 1000L)
        return generateCode(secretBytes, counter, digits)
    }

    private fun generateCode(secretBytes: ByteArray, counter: Long, digits: Int): String {
        val data = ByteBuffer.allocate(8).putLong(counter).array()
        val mac = Mac.getInstance(HMAC_ALGORITHM)
        mac.init(SecretKeySpec(secretBytes, HMAC_ALGORITHM))
        val hash = mac.doFinal(data)
        val offset = hash.last().toInt() and 0x0f
        val binary = ((hash[offset].toInt() and 0x7f) shl 24) or
            ((hash[offset + 1].toInt() and 0xff) shl 16) or
            ((hash[offset + 2].toInt() and 0xff) shl 8) or
            (hash[offset + 3].toInt() and 0xff)

        val mod = 10.0.pow(digits).toLong()
        val otp = binary % mod
        return otp.toString().padStart(digits, '0')
    }

    private fun base32Encode(input: ByteArray): String {
        if (input.isEmpty()) return ""

        val output = StringBuilder((input.size * 8 + 4) / 5)
        var buffer = 0
        var bitsLeft = 0

        for (byte in input) {
            buffer = (buffer shl 8) or (byte.toInt() and 0xff)
            bitsLeft += 8

            while (bitsLeft >= 5) {
                val index = (buffer shr (bitsLeft - 5)) and 0x1f
                output.append(BASE32_ALPHABET[index])
                bitsLeft -= 5
            }
        }

        if (bitsLeft > 0) {
            val index = (buffer shl (5 - bitsLeft)) and 0x1f
            output.append(BASE32_ALPHABET[index])
        }

        while (output.length % 8 != 0) {
            output.append('=')
        }

        return output.toString()
    }

    private fun base32Decode(input: String): ByteArray {
        val clean = input.trim().replace("=", "").replace(" ", "").uppercase()
        if (clean.isBlank()) return ByteArray(0)

        val bytes = ByteArrayOutputStream(clean.length * 5 / 8)
        var buffer = 0
        var bitsLeft = 0

        for (char in clean) {
            val value = if (char.code < BASE32_LOOKUP.size) BASE32_LOOKUP[char.code] else -1
            if (value < 0) {
                throw IllegalArgumentException("Invalid Base32 character: $char")
            }

            buffer = (buffer shl 5) or value
            bitsLeft += 5

            if (bitsLeft >= 8) {
                bytes.write((buffer shr (bitsLeft - 8)) and 0xff)
                bitsLeft -= 8
            }
        }

        return bytes.toByteArray()
    }

    private fun urlEncode(value: String): String {
        return URLEncoder.encode(value, StandardCharsets.UTF_8)
    }

    private fun encryptSecret(secret: String): String {
        val keyBytes = deriveKeyBytes()
        val iv = ByteArray(12)
        random.nextBytes(iv)

        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, SecretKeySpec(keyBytes, "AES"), GCMParameterSpec(128, iv))
        val encrypted = cipher.doFinal(secret.toByteArray(StandardCharsets.UTF_8))

        val payload = ByteArray(iv.size + encrypted.size)
        System.arraycopy(iv, 0, payload, 0, iv.size)
        System.arraycopy(encrypted, 0, payload, iv.size, encrypted.size)
        return java.util.Base64.getEncoder().encodeToString(payload)
    }

    private fun decryptSecret(encrypted: String?): String? {
        if (encrypted.isNullOrBlank()) return null

        return try {
            val payload = java.util.Base64.getDecoder().decode(encrypted)
            if (payload.size <= 12) return null

            val iv = payload.copyOfRange(0, 12)
            val data = payload.copyOfRange(12, payload.size)
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, SecretKeySpec(deriveKeyBytes(), "AES"), GCMParameterSpec(128, iv))
            String(cipher.doFinal(data), StandardCharsets.UTF_8)
        } catch (_: Exception) {
            null
        }
    }

    private fun deriveKeyBytes(): ByteArray {
        val source = when {
            cryptoSeed.isNotBlank() -> cryptoSeed.trim()
            else -> jwtSecret.trim()
        }

        val digest = MessageDigest.getInstance("SHA-256")
        return digest.digest(source.toByteArray(StandardCharsets.UTF_8))
    }

    private fun Double.pow(exponent: Int): Double {
        return Math.pow(this, exponent.toDouble())
    }

    private companion object {
        const val DEFAULT_ISSUER = "Transcendence"
        const val DEFAULT_SECRET_BYTES = 20
        const val DEFAULT_DIGITS = 6
        const val DEFAULT_PERIOD_SECONDS = 30
        const val DEFAULT_WINDOW = 1
        const val HMAC_ALGORITHM = "HmacSHA1"

        val BASE32_ALPHABET = charArrayOf(
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
            'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
            'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
            'Y', 'Z', '2', '3', '4', '5', '6', '7'
        )

        val BASE32_LOOKUP = IntArray(128) { -1 }.apply {
            BASE32_ALPHABET.forEachIndexed { index, c ->
                this[c.code] = index
            }
        }
    }
}
