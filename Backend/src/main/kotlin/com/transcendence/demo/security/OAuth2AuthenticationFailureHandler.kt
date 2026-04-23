package com.transcendence.demo.security

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.AuthenticationException
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.web.RedirectStrategy
import org.springframework.security.web.authentication.AuthenticationFailureHandler
import org.springframework.security.web.DefaultRedirectStrategy
import org.springframework.stereotype.Component
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@Component
class OAuth2AuthenticationFailureHandler : AuthenticationFailureHandler {

	private val redirectStrategy: RedirectStrategy = DefaultRedirectStrategy()

	override fun onAuthenticationFailure(
		request: HttpServletRequest,
		response: HttpServletResponse,
		exception: AuthenticationException
	) {
		val oauth2Exception = exception as? OAuth2AuthenticationException
		val errorCode = oauth2Exception?.error?.errorCode ?: "oauth2_authentication_failed"
		val description = oauth2Exception?.error?.description
			?: exception.message
			?: "OAuth2 authentication failed"

		val targetUrl = buildString {
			append("/auth/oauth2/authorize/google/failure")
			append("?error=")
			append(urlEncode(errorCode))
			append("&error_description=")
			append(urlEncode(description))
		}

		redirectStrategy.sendRedirect(request, response, targetUrl)
	}

	private fun urlEncode(value: String): String =
		URLEncoder.encode(value, StandardCharsets.UTF_8)
}
