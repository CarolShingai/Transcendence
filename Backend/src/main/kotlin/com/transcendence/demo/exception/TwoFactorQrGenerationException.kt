package com.transcendence.demo.exception

class TwoFactorQrGenerationException(
    message: String,
    cause: Throwable? = null
) : RuntimeException(message, cause)