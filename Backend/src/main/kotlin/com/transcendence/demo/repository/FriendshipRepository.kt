package com.transcendence.demo.repository

import com.transcendence.demo.entity.Friendship
import com.transcendence.demo.entity.FriendshipStatus
import com.transcendence.demo.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface FriendshipRepository : JpaRepository<Friendship, Long> {
    fun existsByRequesterAndReceiver(requester: User, receiver: User): Boolean

    fun findByReceiverIdAndStatus(receiverId: Long, status: FriendshipStatus): List<Friendship>

        @Query(
                """
                select distinct f
                from Friendship f
                join fetch f.requester
                join fetch f.receiver
                where f.status = com.transcendence.demo.entity.FriendshipStatus.PENDING
                    and (f.requester.id = :userId or f.receiver.id = :userId)
                order by f.createdAt desc
                """
        )
        fun findPendingFriendshipsByUserId(@Param("userId") userId: Long): List<Friendship>

    @Query(
        """
        select case when count(f) > 0 then true else false end
        from Friendship f
        where (
            (f.requester.id = :firstUserId and f.receiver.id = :secondUserId)
            or
            (f.requester.id = :secondUserId and f.receiver.id = :firstUserId)
        )
        """
    )
    fun existsBetweenUsers(
        @Param("firstUserId") firstUserId: Long,
        @Param("secondUserId") secondUserId: Long
    ): Boolean

    @Query(
        """
        select distinct f
        from Friendship f
        join fetch f.requester
        join fetch f.receiver
        where f.status = com.transcendence.demo.entity.FriendshipStatus.ACCEPTED
          and (f.requester.id = :userId or f.receiver.id = :userId)
        """
    )
    fun findAcceptedFriendshipsByUserId(@Param("userId") userId: Long): List<Friendship>

    @Query(
        value = """
        select distinct u.*
        from users u
        join friendships f on (
            (f.requester_id = :userId and f.receiver_id = u.id)
            or
            (f.receiver_id = :userId and f.requester_id = u.id)
        )
        where f.status = 'ACCEPTED'
        """,
        nativeQuery = true
    )
    fun findFriends(@Param("userId") userId: Long): List<User>
}
