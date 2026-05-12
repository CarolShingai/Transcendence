plugins {
    kotlin("jvm") version "2.2.21"
    kotlin("plugin.spring") version "2.2.21"
    id("org.springframework.boot") version "4.0.2"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("plugin.jpa") version "2.2.21"
}

group = "com.transcendence"
version = "0.0.1-SNAPSHOT"
description = "Demo project for Spring Boot"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(23)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

        // Database Migrations - Flyway
        implementation("org.flywaydb:flyway-mysql")
    
    // Swagger/OpenAPI
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:3.0.0")
    
    // Monitoring & Metrics
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("io.micrometer:micrometer-registry-prometheus")
    
    // Security - BCrypt
    implementation("org.springframework.security:spring-security-crypto:6.2.2")
    
    // Database drivers
    runtimeOnly("com.mysql:mysql-connector-j")
    implementation("org.xerial:sqlite-jdbc") // Para desenvolvimento local
    implementation("org.hibernate.orm:hibernate-community-dialects")
    
	// Spring dependencies
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testImplementation("org.springframework.security:spring-security-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testRuntimeOnly("com.h2database:h2")

    // Token -JWT
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

    //Oauth
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")

    // TOTP / QR code support for 2FA
    implementation("dev.samstevens.totp:totp:1.7.1")
    implementation("com.google.zxing:core:3.5.1")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
    }
}

allOpen {
    annotation("jakarta.persistence.Entity")
    annotation("jakarta.persistence.MappedSuperclass")
    annotation("jakarta.persistence.Embeddable")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
