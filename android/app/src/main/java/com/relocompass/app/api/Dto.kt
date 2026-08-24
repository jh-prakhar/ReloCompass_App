package com.relocompass.app.api

import com.google.gson.annotations.SerializedName

// ── Auth ────────────────────────────────────────────────────────────────────

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val role: String, // student | job_seeker | employer
)

data class LoginRequest(val email: String, val password: String)

data class TokenResponse(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("token_type") val tokenType: String,
    val user: User,
)

data class User(
    val id: Int,
    val name: String,
    val email: String,
    val role: String,
    @SerializedName("is_active") val isActive: Boolean = true,
    @SerializedName("is_admin") val isAdmin: Boolean = false,
    @SerializedName("created_at") val createdAt: String? = null,
    val phone: String? = null,
    val country: String? = null,
    val city: String? = null,
    val bio: String? = null,
)

data class ProfileUpdate(
    val name: String? = null,
    val phone: String? = null,
    val country: String? = null,
    val city: String? = null,
    val bio: String? = null,
)

data class MessageResponse(
    val message: String,
    val detail: String? = null,
)

// ── Jobs ────────────────────────────────────────────────────────────────────

data class Job(
    val id: Int,
    val title: String,
    val company: String,
    val description: String? = null,
    val location: String? = null,
    @SerializedName("job_type") val jobType: String? = null,
    @SerializedName("visa_sponsorship") val visaSponsorship: Boolean = false,
    @SerializedName("experience_years") val experienceYears: String? = null,
    @SerializedName("is_sample") val isSample: Boolean = false,
    @SerializedName("is_active") val isActive: Boolean = true,
    @SerializedName("created_at") val createdAt: String? = null,
)

data class JobCreate(
    val title: String,
    val company: String,
    val description: String? = null,
    val location: String? = null,
    @SerializedName("job_type") val jobType: String? = null,
    @SerializedName("visa_sponsorship") val visaSponsorship: Boolean = false,
    @SerializedName("experience_years") val experienceYears: String? = null,
)

data class Application(
    val id: Int,
    @SerializedName("job_id") val jobId: Int,
    @SerializedName("user_id") val userId: Int,
    val status: String,
    @SerializedName("cover_letter") val coverLetter: String? = null,
    @SerializedName("created_at") val createdAt: String? = null,
    val applicant: User? = null, // present only in employer views
)

data class ApplyRequest(
    @SerializedName("cover_letter") val coverLetter: String? = null,
)

data class StatusUpdate(val status: String) // pending|reviewed|shortlisted|rejected|accepted

// ── Chat ────────────────────────────────────────────────────────────────────

data class ChatRequest(
    val message: String,
    @SerializedName("session_id") val sessionId: String? = null,
    @SerializedName("user_context") val userContext: String? = null,
)

data class ChatResponse(
    val reply: String,
    @SerializedName("session_id") val sessionId: String,
    val sources: List<Map<String, String>> = emptyList(),
    @SerializedName("model_used") val modelUsed: String? = null,
)

data class ChatHistory(
    @SerializedName("session_id") val sessionId: String,
    val messages: List<ChatTurn> = emptyList(),
)

data class ChatTurn(val role: String, val content: String)

// ── Error envelope ──────────────────────────────────────────────────────────

/** FastAPI HTTPException bodies look like {"detail": "..."} or {"detail": [{...}]} */
data class ApiError(val detail: Any? = null) {
    /** Flatten the detail into a human-readable message. */
    fun message(): String = when (detail) {
        null -> "Request failed"
        is String -> detail
        is List<*> -> detail.joinToString("\n") { item ->
            when (item) {
                is Map<*, *> -> buildString {
                    val field = item["loc"]?.let { (it as? List<*>)?.lastOrNull() } ?: "field"
                    append(field).append(": ").append(item["msg"] ?: "invalid")
                }
                else -> item.toString()
            }
        }
        else -> detail.toString()
    }
}
