package com.transcendence.demo.service

import dev.samstevens.totp.code.CodeVerifier
import dev.samstevens.totp.code.DefaultCodeGenerator
import dev.samstevens.totp.code.DefaultCodeVerifier
import dev.samstevens.totp.qr.QrData
import dev.samstevens.totp.qr.ZxingPngQrGenerator
import dev.samstevens.totp.secret.DefaultSecretGenerator
import dev.samstevens.totp.secret.SecretGenerator
import dev.samstevens.totp.time.SystemTimeProvider
import org.springframework.stereotype.Service
import java.util.*
import kotlin.random.Random

@Service
class TwoFactorService {

    private val secretGenerator: SecretGenerator = DefaultSecretGenerator()
    private val codeVerifier: CodeVerifier = DefaultCodeVerifier(DefaultCodeGenerator(), SystemTimeProvider())

    /**
     * Generates a temporary TOTP secret for 2FA setup
     */
    fun generateTempSecret(): String {
        return secretGenerator.generate()
    }

    /**
     * Generates QR code URL for TOTP setup
     */
    fun generateQrCodeUrl(email: String, secret: String): String {
        val qrData = QrData.Builder()
            .label(email)
            .secret(secret)
            .issuer("Transcendence")
            .build()

        val qrGenerator = ZxingPngQrGenerator()
        return try {
            val imageData = qrGenerator.generate(qrData)
            Base64.getEncoder().encodeToString(imageData)
        } catch (e: Exception) {
            throw RuntimeException("Failed to generate QR code", e)
        }
    }

    /**
     * Generates QR code image as base64 string
     */
    fun generateQrCodeImage(email: String, secret: String): String {
        val qrData = QrData.Builder()
            .label(email)
            .secret(secret)
            .issuer("Transcendence")
            .build()

        val qrGenerator = ZxingPngQrGenerator()
        return try {
            val imageData = qrGenerator.generate(qrData)
            Base64.getEncoder().encodeToString(imageData)
        } catch (e: Exception) {
            throw RuntimeException("Failed to generate QR code", e)
        }
    }

    /**
     * Verifies TOTP token against secret
     */
    fun verifyToken(token: String, secret: String): Boolean {
        return try {
            codeVerifier.isValidCode(token, secret)
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Generates 10 backup codes for a user
     */
    fun generateBackupCodes(): List<String> {
        val codes = mutableListOf<String>()
        for (i in 1..10) {
            codes.add(generateBackupCodeString())
        }
        return codes
    }

    /**
     * Verifies if the provided backup code is valid
     */
    fun verifyBackupCode(inputCode: String, backupCodesJson: String): Boolean {
        val backupCodes = parseBackupCodes(backupCodesJson)
        return backupCodes.contains(inputCode)
    }

    /**
     * Removes used backup code from the list
     */
    fun removeBackupCode(inputCode: String, backupCodesJson: String): String {
        val backupCodes = parseBackupCodes(backupCodesJson).toMutableList()
        backupCodes.remove(inputCode)
        return backupCodes.joinToString(",")
    }

    /**
     * Parses backup codes from JSON string
     */
    private fun parseBackupCodes(json: String): List<String> {
        return if (json.isBlank()) {
            emptyList()
        } else {
            json.split(",")
        }
    }

    /**
     * Generates a random backup code string (format: XXXXX-XXXXX)
     */
    private fun generateBackupCodeString(): String {
        val part1 = (1..5).map { Random.nextInt(0, 10) }.joinToString("")
        val part2 = (1..5).map { Random.nextInt(0, 10) }.joinToString("")
        return "$part1-$part2"
    }
}
