package com.transcendence.demo.exception

import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(
        ex: IllegalArgumentException,
        request: HttpServletRequest
    ): ResponseEntity<ApiErrorResponse> {
        return buildResponse(
            status = HttpStatus.BAD_REQUEST,
            message = ex.message ?: "Invalid request",
            path = request.requestURI
        )
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(
        ex: MethodArgumentNotValidException,
        request: HttpServletRequest
    ): ResponseEntity<ApiErrorResponse> {
        val message = ex.bindingResult.fieldErrors
            .firstOrNull()
            ?.defaultMessage
            ?: "Validation error"

        return buildResponse(
            status = HttpStatus.BAD_REQUEST,
            message = message,
            path = request.requestURI
        )
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleMalformedBody(
        ex: HttpMessageNotReadableException,
        request: HttpServletRequest
    ): ResponseEntity<ApiErrorResponse> {
        return buildResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Malformed JSON request body",
            path = request.requestURI
        )
    }

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDataIntegrity(
        ex: DataIntegrityViolationException,
        request: HttpServletRequest
    ): ResponseEntity<ApiErrorResponse> {
        logger.warn("Data integrity violation on {}: {}", request.requestURI, ex.mostSpecificCause?.message)

        return buildResponse(
            status = HttpStatus.CONFLICT,
            message = "Database constraint violation",
            path = request.requestURI
        )
    }

    @ExceptionHandler(Exception::class)
    fun handleUnexpected(
        ex: Exception,
        request: HttpServletRequest
    ): ResponseEntity<ApiErrorResponse> {
        logger.error("Unexpected error on {}", request.requestURI, ex)

        return buildResponse(
            status = HttpStatus.INTERNAL_SERVER_ERROR,
            message = "Unexpected internal error",
            path = request.requestURI
        )
    }

    private fun buildResponse(
        status: HttpStatus,
        message: String,
        path: String
    ): ResponseEntity<ApiErrorResponse> {
        val body = ApiErrorResponse(
            status = status.value(),
            error = status.reasonPhrase,
            message = message,
            path = path
        )
        return ResponseEntity.status(status).body(body)
    }
}

data class ApiErrorResponse(
    val status: Int,
    val error: String,
    val message: String,
    val path: String
)
