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
    @Value("\${jwt.secret}")
    private lateinit var secretKey: String

    @Value("\${jwt.expiration-ms:86400000}")
    private var expirationMs: Long = 86400000

    // Method to generate JWT token based on user information 24 hours expiration
    fun generateToken(userId: Long, email: String): String {
        val now = Date()
        val expiryDate = Date(now.time + expirationMs)
        val key: SecretKey = buildSigningKey()

        return Jwts.builder()
            .setSubject(userId.toString())
            .claim("email", email)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(key, SignatureAlgorithm.HS512)
            .compact()
    }

    fun extractEmail(token: String): String? {
        val claims = parseClaims(token) ?: return null
        return claims["email"] as? String
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