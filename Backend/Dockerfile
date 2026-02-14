# syntax=docker/dockerfile:1

# Build stage: compila o Spring Boot Kotlin usando Gradle Wrapper
FROM eclipse-temurin:17-jdk AS build
WORKDIR /workspace

# Copia arquivos essenciais primeiro para melhor cache
COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle.kts settings.gradle.kts ./
COPY src ./src

RUN chmod +x gradlew \
	&& ./gradlew --no-daemon clean bootJar -x test

# Runtime stage: imagem mais leve só com o JRE
FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

# Defina o profile padrão (ajuste conforme necessário)
ENV SPRING_PROFILES_ACTIVE=prod

# Copia o jar construído
COPY --from=build /workspace/build/libs/*.jar /app/app.jar

# Porta padrão do Spring Boot
EXPOSE 8080

# Executa a aplicação
ENTRYPOINT ["java", "-jar", "/app/app.jar"]