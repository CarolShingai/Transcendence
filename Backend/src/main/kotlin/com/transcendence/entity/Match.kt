package com.transcendence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.OffsetDateTime

@Entity
@Table(name = "matches")
data class Match(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @ManyToOne
    @JoinColumn(name = "map_id", nullable = false)
    val map: MapEntity,

    val score: Int? = null,

    @Column(name = "duration_seconds")
    val durationSeconds: Int? = null,

    @Column(columnDefinition = "jsonb")
    val metadata: String? = null,

    @Column(name = "created_at")
    val createdAt: OffsetDateTime? = null
)
