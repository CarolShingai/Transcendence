package com.transcendence.demo.providers

import io.jsonwebtoken.Claims
import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.io.DecodingException
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtTokenGenerator {
    private companion object {
        const val PURPOSE_CLAIM = "purpose"
        const val PURPOSE_ACCESS = "access"
        const val PURPOSE_TWO_FACTOR = "2fa"
    }

    @Value("\${jwt.secret}")
    private lateinit var secretKey: String

    @Value("\${jwt.expiration-ms:86400000}")
    private var expirationMs: Long = 86400000

    @Value("\${jwt.two-factor-expiration-ms:300000}")
    private var twoFactorExpirationMs: Long = 300000

    // Method to generate JWT token based on user information 24 hours expiration
    fun generateToken(userId: Long, email: String): String {
        return buildToken(userId, email, PURPOSE_ACCESS, expirationMs)
    }

    fun generateTwoFactorChallengeToken(userId: Long, email: String): String {
        return buildToken(userId, email, PURPOSE_TWO_FACTOR, twoFactorExpirationMs)
    }

    fun extractEmail(token: String): String? {
        val claims = parseClaims(token) ?: return null
        return claims["email"] as? String
    }

    fun extractUserId(token: String): Long? {
        val claims = parseClaims(token) ?: return null
        return claims.subject?.toLongOrNull()
    }

    fun isAccessTokenValid(token: String): Boolean {
        val claims = parseClaims(token) ?: return false
        val purpose = claims[PURPOSE_CLAIM] as? String
        return purpose == null || purpose == PURPOSE_ACCESS
    }

    fun isTwoFactorChallengeToken(token: String): Boolean {
        val claims = parseClaims(token) ?: return false
        return claims[PURPOSE_CLAIM] == PURPOSE_TWO_FACTOR
    }

    private fun buildToken(userId: Long, email: String, purpose: String, expiration: Long): String {
        val now = Date()
        val expiryDate = Date(now.time + expiration)
        val key: SecretKey = buildSigningKey()

        return Jwts.builder()
            .setSubject(userId.toString())
            .claim("email", email)
            .claim(PURPOSE_CLAIM, purpose)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(key, SignatureAlgorithm.HS512)
            .compact()
    }

    fun isTokenValid(token: String): Boolean {
        return parseClaims(token) != null
    }

    private fun parseClaims(token: String): Claims? {
        return try {
            Jwts.parser()
                .verifyWith(buildSigningKey())
                .build()
                .parseSignedClaims(token)
                .payload
        } catch (_: JwtException) {
            null
        } catch (_: IllegalArgumentException) {
            null
        }
    }

    private fun buildSigningKey(): SecretKey {
        val normalized = secretKey.trim()
        if (normalized.isBlank()) {
            throw IllegalStateException("JWT_SECRET is empty. Configure a valid Base64 secret with at least 64 bytes for HS512.")
        }

        val keyBytes = try {
            Decoders.BASE64.decode(normalized)
        } catch (_: DecodingException) {
            throw IllegalStateException("JWT_SECRET must be a valid Base64 value.")
        }

        return Keys.hmacShaKeyFor(keyBytes)
    }
}