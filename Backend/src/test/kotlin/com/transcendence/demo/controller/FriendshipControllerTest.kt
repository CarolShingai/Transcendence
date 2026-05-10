package com.transcendence.demo.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.transcendence.demo.DTO.Request.SendFriendRequestDTO
import com.transcendence.demo.entity.Friendship
import com.transcendence.demo.entity.FriendshipStatus
import com.transcendence.demo.entity.User
import com.transcendence.demo.providers.JwtTokenGenerator
import com.transcendence.demo.repository.FriendshipRepository
import com.transcendence.demo.repository.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FriendshipControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    private val objectMapper: ObjectMapper = jacksonObjectMapper()

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var friendshipRepository: FriendshipRepository

    @Autowired
    private lateinit var jwtTokenGenerator: JwtTokenGenerator

    private val passwordEncoder = BCryptPasswordEncoder()

    @BeforeEach
    fun setup() {
        friendshipRepository.deleteAll()
        userRepository.deleteAll()
    }

    @Nested
    @DisplayName("POST /friends/request")
    inner class SendFriendRequest {

        @Test
        fun `should send friend request successfully`() {
            val requester = createTestUser("requester@example.com", "requester")
            val receiver = createTestUser("receiver@example.com", "receiver")
            val token = jwtTokenGenerator.generateToken(requester.id!!, requester.email)

            val request = SendFriendRequestDTO(receiverId = receiver.id!!)

            mockMvc.perform(
                post("/friends/request")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isCreated)
                .andExpect(jsonPath("$.requesterId").value(requester.id))
                .andExpect(jsonPath("$.receiverId").value(receiver.id))
                .andExpect(jsonPath("$.status").value("PENDING"))
        }

        @Test
        fun `should fail when sending request to self`() {
            val user = createTestUser("self@example.com", "selfuser")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            val request = SendFriendRequestDTO(receiverId = user.id!!)

            mockMvc.perform(
                post("/friends/request")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
        }

        @Test
        fun `should fail when friendship already exists`() {
            val requester = createTestUser("dup1@example.com", "dup1")
            val receiver = createTestUser("dup2@example.com", "dup2")
            createFriendship(requester, receiver, FriendshipStatus.PENDING)
            val token = jwtTokenGenerator.generateToken(requester.id!!, requester.email)

            val request = SendFriendRequestDTO(receiverId = receiver.id!!)

            mockMvc.perform(
                post("/friends/request")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
        }

        @Test
        fun `should redirect when no token provided for friend request`() {
            val request = SendFriendRequestDTO(receiverId = 1L)

            mockMvc.perform(
                post("/friends/request")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().is3xxRedirection)
        }

        @Test
        fun `should fail when receiver does not exist`() {
            val requester = createTestUser("req@example.com", "requser")
            val token = jwtTokenGenerator.generateToken(requester.id!!, requester.email)

            val request = SendFriendRequestDTO(receiverId = 999L)

            mockMvc.perform(
                post("/friends/request")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
        }
    }

    @Nested
    @DisplayName("PATCH /friends/{requestId}/accept")
    inner class AcceptFriendRequest {

        @Test
        fun `should accept pending friend request`() {
            val requester = createTestUser("accept1@example.com", "accept1")
            val receiver = createTestUser("accept2@example.com", "accept2")
            val friendship = createFriendship(requester, receiver, FriendshipStatus.PENDING)
            val token = jwtTokenGenerator.generateToken(receiver.id!!, receiver.email)

            mockMvc.perform(
                patch("/friends/${friendship.id}/accept")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.status").value("ACCEPTED"))
        }

        @Test
        fun `should fail when requester tries to accept own request`() {
            val requester = createTestUser("notrecv1@example.com", "notrecv1")
            val receiver = createTestUser("notrecv2@example.com", "notrecv2")
            val friendship = createFriendship(requester, receiver, FriendshipStatus.PENDING)
            val token = jwtTokenGenerator.generateToken(requester.id!!, requester.email)

            mockMvc.perform(
                patch("/friends/${friendship.id}/accept")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isBadRequest)
        }

        @Test
        fun `should fail when request is already processed`() {
            val requester = createTestUser("proc1@example.com", "proc1")
            val receiver = createTestUser("proc2@example.com", "proc2")
            val friendship = createFriendship(requester, receiver, FriendshipStatus.ACCEPTED)
            val token = jwtTokenGenerator.generateToken(receiver.id!!, receiver.email)

            mockMvc.perform(
                patch("/friends/${friendship.id}/accept")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isBadRequest)
        }

        @Test
        fun `should redirect when no token provided for accept`() {
            mockMvc.perform(patch("/friends/1/accept"))
                .andExpect(status().is3xxRedirection)
        }
    }

    @Nested
    @DisplayName("PATCH /friends/{requestId}/reject")
    inner class RejectFriendRequest {

        @Test
        fun `should reject pending friend request`() {
            val requester = createTestUser("reject1@example.com", "reject1")
            val receiver = createTestUser("reject2@example.com", "reject2")
            val friendship = createFriendship(requester, receiver, FriendshipStatus.PENDING)
            val token = jwtTokenGenerator.generateToken(receiver.id!!, receiver.email)

            mockMvc.perform(
                patch("/friends/${friendship.id}/reject")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.status").value("REJECTED"))
        }

        @Test
        fun `should fail when requester tries to reject own request`() {
            val requester = createTestUser("notreject1@example.com", "notreject1")
            val receiver = createTestUser("notreject2@example.com", "notreject2")
            val friendship = createFriendship(requester, receiver, FriendshipStatus.PENDING)
            val token = jwtTokenGenerator.generateToken(requester.id!!, requester.email)

            mockMvc.perform(
                patch("/friends/${friendship.id}/reject")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isBadRequest)
        }

        @Test
        fun `should redirect when no token provided for reject`() {
            mockMvc.perform(patch("/friends/1/reject"))
                .andExpect(status().is3xxRedirection)
        }
    }

    @Nested
    @DisplayName("GET /friends/requests")
    inner class ListPendingRequests {

        @Test
        fun `should list pending friend requests for receiver`() {
            val requester = createTestUser("pending1@example.com", "pending1")
            val receiver = createTestUser("pending2@example.com", "pending2")
            createFriendship(requester, receiver, FriendshipStatus.PENDING)
            val token = jwtTokenGenerator.generateToken(receiver.id!!, receiver.email)

            mockMvc.perform(
                get("/friends/requests")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$").isArray)
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
        }

        @Test
        fun `should return empty list when no pending requests`() {
            val user = createTestUser("nopending@example.com", "nopending")
            val token = jwtTokenGenerator.generateToken(user.id!!, user.email)

            mockMvc.perform(
                get("/friends/requests")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$").isArray)
                .andExpect(jsonPath("$.length()").value(0))
        }

        @Test
        fun `should redirect when no token provided for requests`() {
            mockMvc.perform(get("/friends/requests"))
                .andExpect(status().is3xxRedirection)
        }
    }

    @Nested
    @DisplayName("GET /friends")
    inner class ListFriends {

        @Test
        fun `should list accepted friends`() {
            val user1 = createTestUser("friend1@example.com", "friend1")
            val user2 = createTestUser("friend2@example.com", "friend2")
            createFriendship(user1, user2, FriendshipStatus.ACCEPTED)
            val token = jwtTokenGenerator.generateToken(user1.id!!, user1.email)

            mockMvc.perform(
                get("/friends")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$").isArray)
                .andExpect(jsonPath("$.length()").value(1))
        }

        @Test
        fun `should not list pending friendships`() {
            val user1 = createTestUser("nofriend1@example.com", "nofriend1")
            val user2 = createTestUser("nofriend2@example.com", "nofriend2")
            createFriendship(user1, user2, FriendshipStatus.PENDING)
            val token = jwtTokenGenerator.generateToken(user1.id!!, user1.email)

            mockMvc.perform(
                get("/friends")
                    .header("Authorization", "Bearer $token")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$").isArray)
                .andExpect(jsonPath("$.length()").value(0))
        }

        @Test
        fun `should redirect when no token provided for friends list`() {
            mockMvc.perform(get("/friends"))
                .andExpect(status().is3xxRedirection)
        }
    }

    private fun createTestUser(email: String, nickname: String): User {
        val user = User(
            nickname = nickname,
            name = "Test $nickname",
            email = email,
            username = nickname,
            passwordHash = passwordEncoder.encode("password123"),
            profilePic = 0
        )
        return userRepository.save(user)
    }

    private fun createFriendship(requester: User, receiver: User, status: FriendshipStatus): Friendship {
        val friendship = Friendship(
            requester = requester,
            receiver = receiver,
            status = status
        )
        return friendshipRepository.save(friendship)
    }
}
