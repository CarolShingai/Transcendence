package com.transcendence.repository

import com.transcendence.entity.MapEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MapRepository : JpaRepository<MapEntity, Long>
