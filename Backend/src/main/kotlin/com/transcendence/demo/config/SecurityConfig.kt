package com.transcendence.demo.config

import com.transcendence.demo.security.JwtAuthenticationFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
	private val jwtAuthenticationFilter: JwtAuthenticationFilter
) {

	private val publicPaths = arrayOf(
		"/oauth2/authorization/google",
		"/login/oauth2/code/google",
		"/auth/oauth2/authorize/google",
		"/auth/oauth2/authorize/google/failure",
		"/error",
		"/v3/api-docs/**",
		"/swagger-ui/**",
		"/swagger-ui.html"
	)

	@Bean
	fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
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
					.requestMatchers(*publicPaths).permitAll()
					.anyRequest().authenticated()
			}
			.oauth2Login { oauth ->
				// Redireciona para endpoints REST existentes para evitar 404/loop no callback OAuth2.
				oauth.defaultSuccessUrl("/auth/oauth2/authorize/google/success", true)
				oauth.failureHandler(SimpleUrlAuthenticationFailureHandler("/auth/oauth2/authorize/google/failure"))
			}
			.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

		return http.build()
	}

	@Bean
	fun corsConfigurationSource(): CorsConfigurationSource {
		val config = CorsConfiguration()
		config.allowedOrigins = listOf("http://localhost:4200")
		config.allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
		config.allowedHeaders = listOf("*")
		config.allowCredentials = true

		val source = UrlBasedCorsConfigurationSource()
		source.registerCorsConfiguration("/**", config)
		return source
	}
}