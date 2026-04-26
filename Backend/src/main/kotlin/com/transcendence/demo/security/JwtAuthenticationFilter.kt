package com.transcendence.demo.security

import com.transcendence.demo.providers.JwtTokenGenerator
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtTokenGenerator: JwtTokenGenerator
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authHeader = request.getHeader("Authorization")
        if (authHeader.isNullOrBlank() || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response)
            return
        }

        val token = authHeader.removePrefix("Bearer ").trim()
        if (token.isBlank() || SecurityContextHolder.getContext().authentication != null) {
            filterChain.doFilter(request, response)
            return
        }

        if (!jwtTokenGenerator.isAccessTokenValid(token)) {
            filterChain.doFilter(request, response)
            return
        }

        val email = jwtTokenGenerator.extractEmail(token)
        if (email.isNullOrBlank()) {
            filterChain.doFilter(request, response)
            return
        }

        val authentication = UsernamePasswordAuthenticationToken(email, null, emptyList())
        authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
        SecurityContextHolder.getContext().authentication = authentication

        filterChain.doFilter(request, response)
    }
}
