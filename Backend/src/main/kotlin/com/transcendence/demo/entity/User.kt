package com.transcendence.demo.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, unique = false)
    var nickname: String = "",

    @Column(nullable = false)
    var name: String = "",

    @Column(nullable = false, unique = false)
    var email: String = "",

    @Column(nullable = false)
    var criptpass: String = ""
)

