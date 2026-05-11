package com.transcendence.demo.repository

import com.transcendence.demo.entity.MapEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MapRepository : JpaRepository<MapEntity, Long>
