package com.relocompass.app.api

class ApiException(val code: Int, override val message: String) : Exception(message)

/** Parse an error body like {"detail": "..."} into a readable message. */
object Errors {
    fun parse(code: Int, rawBody: String?): String {
        if (rawBody.isNullOrBlank()) return fallback(code)
        return try {
            val parsed = GsonHolder.gson.fromJson(rawBody, ApiError::class.java)
            parsed.message()
        } catch (_: Exception) {
            fallback(code)
        }
    }

    private fun fallback(code: Int) = when (code) {
        401 -> "Session expired — please log in again"
        403 -> "You don't have permission to do that"
        404 -> "Not found"
        409 -> "Already exists"
        422 -> "Please check the entered values"
        503 -> "Service temporarily unavailable — try again shortly"
        in 500..599 -> "Server error — try again shortly"
        else -> "Request failed (HTTP $code)"
    }
}
