package com.transcendence.demo.security

import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest
import org.springframework.stereotype.Component
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.ObjectInputStream
import java.io.ObjectOutputStream
import java.util.Base64

@Component
class CookieOAuth2AuthorizationRequestRepository : AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    override fun loadAuthorizationRequest(request: HttpServletRequest): OAuth2AuthorizationRequest? {
        val encoded = request.cookies
            ?.firstOrNull { it.name == AUTH_REQUEST_COOKIE_NAME }
            ?.value
            ?: return null

        return decode(encoded)
    }

    override fun saveAuthorizationRequest(
        authorizationRequest: OAuth2AuthorizationRequest?,
        request: HttpServletRequest,
        response: HttpServletResponse
    ) {
        if (authorizationRequest == null) {
            deleteCookie(request, response, AUTH_REQUEST_COOKIE_NAME)
            return
        }

        val encoded = encode(authorizationRequest) ?: run {
            deleteCookie(request, response, AUTH_REQUEST_COOKIE_NAME)
            return
        }

        addCookie(response, AUTH_REQUEST_COOKIE_NAME, encoded, COOKIE_EXPIRE_SECONDS, request.isSecure)
    }

    override fun removeAuthorizationRequest(
        request: HttpServletRequest,
        response: HttpServletResponse
    ): OAuth2AuthorizationRequest? {
        val authorizationRequest = loadAuthorizationRequest(request)
        deleteCookie(request, response, AUTH_REQUEST_COOKIE_NAME)
        return authorizationRequest
    }

    private fun encode(obj: OAuth2AuthorizationRequest): String? {
        return try {
            val outputStream = ByteArrayOutputStream()
            ObjectOutputStream(outputStream).use { it.writeObject(obj) }
            Base64.getUrlEncoder().encodeToString(outputStream.toByteArray())
        } catch (_: Exception) {
            null
        }
    }

    private fun decode(value: String): OAuth2AuthorizationRequest? {
        return try {
            val bytes = Base64.getUrlDecoder().decode(value)
            val inputStream = ByteArrayInputStream(bytes)
            ObjectInputStream(inputStream).use { it.readObject() as? OAuth2AuthorizationRequest }
        } catch (_: Exception) {
            null
        }
    }

    private fun addCookie(
        response: HttpServletResponse,
        name: String,
        value: String,
        maxAge: Int,
        secure: Boolean
    ) {
        val cookie = Cookie(name, value)
        cookie.path = "/"
        cookie.isHttpOnly = true
        cookie.secure = secure
        cookie.maxAge = maxAge
        response.addCookie(cookie)
    }

    private fun deleteCookie(request: HttpServletRequest, response: HttpServletResponse, name: String) {
        val cookie = request.cookies?.firstOrNull { it.name == name } ?: Cookie(name, "")
        cookie.value = ""
        cookie.path = "/"
        cookie.maxAge = 0
        response.addCookie(cookie)
    }

    companion object {
        private const val AUTH_REQUEST_COOKIE_NAME = "oauth2_auth_request"
        private const val COOKIE_EXPIRE_SECONDS = 180
    }
}