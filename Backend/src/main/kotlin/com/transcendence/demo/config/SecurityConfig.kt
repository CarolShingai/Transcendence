package com.transcendence.demo.config

import com.transcendence.demo.security.JwtAuthenticationFilter
import com.transcendence.demo.security.OAuth2AuthenticationFailureHandler
import com.transcendence.demo.security.CookieOAuth2AuthorizationRequestRepository
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.SecurityFilterChain
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
	private val jwtAuthenticationFilter: JwtAuthenticationFilter,
	private val clientRegistrationRepository: ClientRegistrationRepository?,
	private val oAuth2AuthenticationFailureHandler: OAuth2AuthenticationFailureHandler?,
	private val cookieOAuth2AuthorizationRequestRepository: CookieOAuth2AuthorizationRequestRepository?,
	@Value("\${app.cors.allowed-origins:http://localhost:3000}")
	private val corsAllowedOrigins: String
) {

	private val publicPaths = arrayOf(
		"/",
		"/health",
		"/oauth2/authorization/google",
		"/login/oauth2/code/google",
		"/auth/oauth2/authorize/google",
		"/auth/oauth2/authorize/google/success",
		"/auth/oauth2/authorize/google/failure",
		"/ws",
		"/ws/**",
		"/error",
		"/v3/api-docs/**",
		"/swagger-ui/**",
		"/swagger-ui.html"
	)

	@Bean
	fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
		val authorizationRequestResolver = if (clientRegistrationRepository != null) googleAuthorizationRequestResolver() else null

		http
			.csrf { it.disable() }
			.cors { }
			.httpBasic { it.disable() }
			.formLogin { it.disable() }
			.sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) }
			.authorizeHttpRequests { auth ->
				auth
					.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
					.requestMatchers(HttpMethod.POST, "/auth/register", "/auth/login").permitAll()
					.requestMatchers(HttpMethod.POST, "/auth/2fa/setup", "/auth/2fa/enable", "/auth/2fa/disable").authenticated()
					.requestMatchers(*publicPaths).permitAll()
					.anyRequest().authenticated()
			}

		// Only configure OAuth2 if it's enabled (clientRegistrationRepository is available)
		if (clientRegistrationRepository != null && oAuth2AuthenticationFailureHandler != null) {
			http.oauth2Login { oauth ->
				if (authorizationRequestResolver != null && cookieOAuth2AuthorizationRequestRepository != null) {
					oauth.authorizationEndpoint { authorization ->
						authorization.authorizationRequestResolver(authorizationRequestResolver)
						authorization.authorizationRequestRepository(cookieOAuth2AuthorizationRequestRepository)
					}
				}
				// Redireciona para endpoints REST existentes para evitar 404/loop no callback OAuth2.
				oauth.defaultSuccessUrl("/auth/oauth2/authorize/google/success", true)
				oauth.failureHandler(oAuth2AuthenticationFailureHandler)
			}
		}

		http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

		return http.build()
	}

	@Bean
	fun corsConfigurationSource(): CorsConfigurationSource {
		val config = CorsConfiguration()
		config.allowedOrigins = corsAllowedOrigins
			.split(",")
			.map { it.trim() }
			.filter { it.isNotBlank() }
		config.allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
		config.allowedHeaders = listOf("*")
		config.allowCredentials = true

		val source = UrlBasedCorsConfigurationSource()
		source.registerCorsConfiguration("/**", config)
		return source
	}

	@Bean
	fun googleAuthorizationRequestResolver(): OAuth2AuthorizationRequestResolver? {
		if (clientRegistrationRepository == null) return null

		val defaultResolver = DefaultOAuth2AuthorizationRequestResolver(
			clientRegistrationRepository,
			"/oauth2/authorization"
		)

		return object : OAuth2AuthorizationRequestResolver {
			override fun resolve(request: jakarta.servlet.http.HttpServletRequest): OAuth2AuthorizationRequest? {
				val authorizationRequest = defaultResolver.resolve(request)
				return customizeGoogleAuthorizationRequest(authorizationRequest)
			}

			override fun resolve(
				request: jakarta.servlet.http.HttpServletRequest,
				clientRegistrationId: String
			): OAuth2AuthorizationRequest? {
				val authorizationRequest = defaultResolver.resolve(request, clientRegistrationId)
				return customizeGoogleAuthorizationRequest(authorizationRequest)
			}
		}
	}

	private fun customizeGoogleAuthorizationRequest(request: OAuth2AuthorizationRequest?): OAuth2AuthorizationRequest? {
		if (request == null) return null
		if (request.attributes["registration_id"] != "google") return request

		val additionalParameters = LinkedHashMap(request.additionalParameters)
		additionalParameters["prompt"] = "select_account consent"
		additionalParameters["access_type"] = "offline"

		return OAuth2AuthorizationRequest.from(request)
			.additionalParameters(additionalParameters)
			.build()
	}
}