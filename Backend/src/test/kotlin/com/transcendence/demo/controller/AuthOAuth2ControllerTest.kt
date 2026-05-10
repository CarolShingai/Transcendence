package com.transcendence.demo.controller

import com.transcendence.demo.repository.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.DefaultOAuth2User
import org.springframework.security.oauth2.core.user.OAuth2UserAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthOAuth2ControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @BeforeEach
    fun setup() {
        userRepository.deleteAll()
    }

    @Nested
    @DisplayName("GET /auth/oauth2/authorize/google")
    inner class OAuthRedirect {

        @Test
        fun `should redirect to Google OAuth2 authorization`() {
            mockMvc.perform(get("/auth/oauth2/authorize/google"))
                .andExpect(status().is3xxRedirection)
                .andExpect(redirectedUrl("/oauth2/authorization/google"))
        }
    }

    @Nested
    @DisplayName("GET /auth/oauth2/authorize/google/success")
    inner class OAuthSuccess {

        @Test
        fun `should redirect with token on successful OAuth login`() {
            val attributes = mapOf<String, Any>(
                "sub" to "google-id-123",
                "email" to "oauth@example.com",
                "name" to "OAuth User",
                "email_verified" to true
            )

            val authorities = listOf(OAuth2UserAuthority(attributes))
            val oauthUser = DefaultOAuth2User(authorities, attributes, "sub")
            val oauthToken = OAuth2AuthenticationToken(oauthUser, authorities, "google")

            mockMvc.perform(
                get("/auth/oauth2/authorize/google/success")
                    .with(authentication(oauthToken))
            )
                .andExpect(status().is3xxRedirection)
        }

        @Test
        fun `should redirect with error when authentication is null`() {
            mockMvc.perform(get("/auth/oauth2/authorize/google/success"))
                .andExpect(status().is3xxRedirection)
        }

        @Test
        fun `should redirect with error when email is not verified`() {
            val attributes = mapOf<String, Any>(
                "sub" to "google-id-456",
                "email" to "unverified@example.com",
                "name" to "Unverified User",
                "email_verified" to false
            )

            val authorities = listOf(OAuth2UserAuthority(attributes))
            val oauthUser = DefaultOAuth2User(authorities, attributes, "sub")
            val oauthToken = OAuth2AuthenticationToken(oauthUser, authorities, "google")

            mockMvc.perform(
                get("/auth/oauth2/authorize/google/success")
                    .with(authentication(oauthToken))
            )
                .andExpect(status().is3xxRedirection)
        }

        @Test
        fun `should redirect with error when email is blank`() {
            val attributes = mapOf<String, Any>(
                "sub" to "google-id-789",
                "name" to "No Email User",
                "email_verified" to true
            )

            val authorities = listOf(OAuth2UserAuthority(attributes))
            val oauthUser = DefaultOAuth2User(authorities, attributes, "sub")
            val oauthToken = OAuth2AuthenticationToken(oauthUser, authorities, "google")

            mockMvc.perform(
                get("/auth/oauth2/authorize/google/success")
                    .with(authentication(oauthToken))
            )
                .andExpect(status().is3xxRedirection)
        }

        @Test
        fun `should create user on first OAuth login and redirect with token`() {
            val attributes = mapOf<String, Any>(
                "sub" to "google-new-user",
                "email" to "newuser@gmail.com",
                "name" to "New Google User",
                "email_verified" to true
            )

            val authorities = listOf(OAuth2UserAuthority(attributes))
            val oauthUser = DefaultOAuth2User(authorities, attributes, "sub")
            val oauthToken = OAuth2AuthenticationToken(oauthUser, authorities, "google")

            mockMvc.perform(
                get("/auth/oauth2/authorize/google/success")
                    .with(authentication(oauthToken))
            )
                .andExpect(status().is3xxRedirection)

            val savedUser = userRepository.findByEmail("newuser@gmail.com")
            assert(savedUser != null) { "User should have been created in the database" }
            assert(savedUser!!.name == "New Google User") { "User name should match" }
        }
    }

    @Nested
    @DisplayName("GET /auth/oauth2/authorize/google/failure")
    inner class OAuthFailure {

        @Test
        fun `should return failure response`() {
            mockMvc.perform(
                get("/auth/oauth2/authorize/google/failure")
                    .param("error", "access_denied")
                    .param("error_description", "User denied access")
            )
                .andExpect(status().isUnauthorized)
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Google OAuth login failed"))
                .andExpect(jsonPath("$.error").value("access_denied"))
                .andExpect(jsonPath("$.error_description").value("User denied access"))
        }

        @Test
        fun `should return failure response without error params`() {
            mockMvc.perform(get("/auth/oauth2/authorize/google/failure"))
                .andExpect(status().isUnauthorized)
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Google OAuth login failed"))
        }
    }
}
