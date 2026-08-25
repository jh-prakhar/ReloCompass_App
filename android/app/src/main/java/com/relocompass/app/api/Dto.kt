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

// ── Phase 4: job matching ───────────────────────────────────────────────────

data class JobMatch(
    val job: Job,
    val score: Int,
    val reasons: List<String> = emptyList(),
    @SerializedName("skills_matched") val skillsMatched: List<String> = emptyList(),
)

data class MatchResponse(
    val matches: List<JobMatch> = emptyList(),
    @SerializedName("total_scored") val totalScored: Int = 0,
)

// ── Phase 4: visa checklist ─────────────────────────────────────────────────

data class VisaDestination(
    val id: String,
    val label: String,
    @SerializedName("visa_types") val visaTypes: List<VisaTypeRef> = emptyList(),
    @SerializedName("official_sources") val officialSources: List<String> = emptyList(),
)

data class VisaTypeRef(val id: String, val label: String)

data class DestinationsResponse(val destinations: List<VisaDestination> = emptyList())

data class ChecklistItem(
    val id: String,
    val label: String,
    val phase: String,
    val note: String? = null,
)

data class ChecklistPhase(
    val phase: String,
    val label: String,
    val items: List<ChecklistItem> = emptyList(),
)

data class VisaChecklist(
    val destination: String,
    @SerializedName("visa_type") val visaType: String,
    val situation: String? = null,
    val checklist: List<ChecklistPhase> = emptyList(),
    @SerializedName("total_items") val totalItems: Int = 0,
    @SerializedName("official_sources") val officialSources: List<String> = emptyList(),
    val disclaimer: String? = null,
)

// ── Phase 4: community chat ─────────────────────────────────────────────────

data class CommunityRoom(
    val id: String,
    val name: String,
    val description: String? = null,
)

data class CommunityRoomsResponse(val rooms: List<CommunityRoom> = emptyList())

data class CommunityMessage(
    val id: Long,
    val room: String,
    @SerializedName("user_id") val userId: Int,
    @SerializedName("user_name") val userName: String,
    val content: String,
    @SerializedName("created_at") val createdAt: String? = null,
)

data class CommunityHistory(val room: String, val messages: List<CommunityMessage> = emptyList())

/** Inbound WebSocket frames. */
data class WsEvent(
    val type: String, // history | presence | message | error
    val count: Int? = null,
    val detail: String? = null,
    // message payloads share CommunityMessage's fields inline
    val id: Long? = null,
    @SerializedName("user_id") val userId: Int? = null,
    @SerializedName("user_name") val userName: String? = null,
    val content: String? = null,
    @SerializedName("created_at") val createdAt: String? = null,
    val messages: List<CommunityMessage>? = null,
)

/** Outbound WebSocket frames. */
data class WsSend(val type: String, val room: String, val content: String)

// ── Phase 4: university housing ─────────────────────────────────────────────

data class HousingProvider(
    val id: String,
    val label: String,
    val universities: List<String> = emptyList(),
)

data class ProvidersResponse(val providers: List<HousingProvider> = emptyList())

data class HousingOption(
    val provider: String,
    val university: String,
    val campus: String? = null,
    val kind: String, // dorm | studio | shared_flat | homestay
    val title: String,
    @SerializedName("monthly_cost") val monthlyCost: Double,
    val currency: String,
    @SerializedName("available_from") val availableFrom: String? = null,
    @SerializedName("available_to") val availableTo: String? = null,
    @SerializedName("distance_km") val distanceKm: Double? = null,
    @SerializedName("meals_included") val mealsIncluded: Boolean = false,
    val url: String? = null,
    val notes: String? = null,
)

data class AvailabilityResponse(
    val university: String,
    val provider: HousingProviderSummary,
    val options: List<HousingOption> = emptyList(),
    val count: Int = 0,
)

data class HousingProviderSummary(val id: String, val label: String)

// ── Phase 4: password reset ─────────────────────────────────────────────────

data class PasswordResetRequest(val email: String)
