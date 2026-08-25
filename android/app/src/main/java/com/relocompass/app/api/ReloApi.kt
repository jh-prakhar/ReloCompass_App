package com.relocompass.app.api

import retrofit2.http.*

/**
 * ReloCompass backend API (FastAPI, /api).
 * Mirrors the live contract of the deployed service.
 */
interface ReloApi {

    // ── Auth ──
    @POST("auth/register")
    suspend fun register(@Body body: RegisterRequest): TokenResponse

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): TokenResponse

    @POST("auth/logout")
    suspend fun logout(): MessageResponse

    @GET("auth/me")
    suspend fun me(): User

    @PUT("users/me")
    suspend fun updateProfile(@Body body: ProfileUpdate): User

    // ── Jobs ──
    // NOTE: the FastAPI app mounts a static frontend at "/" so routes match
    // EXACTLY as declared: collection routes take a trailing slash, item
    // routes don't. These paths mirror docs/js/*.js on the web client.
    @GET("jobs/")
    suspend fun jobs(
        @Query("q") q: String? = null,
        @Query("location") location: String? = null,
        @Query("visa_only") visaOnly: Boolean? = null,
        @Query("job_type") jobType: String? = null,
        @Query("limit") limit: Int = 50,
        @Query("skip") skip: Int = 0,
    ): List<Job>

    @GET("jobs/mine")
    suspend fun myJobs(): List<Job>

    @POST("jobs/")
    suspend fun createJob(@Body body: JobCreate): Job

    @DELETE("jobs/{jobId}")
    suspend fun deleteJob(@Path("jobId") jobId: Int): MessageResponse

    @POST("jobs/{jobId}/apply")
    suspend fun apply(@Path("jobId") jobId: Int, @Body body: ApplyRequest): Application

    @GET("jobs/applications/me")
    suspend fun myApplications(): List<Application>

    @GET("jobs/{jobId}/applications")
    suspend fun jobApplicants(@Path("jobId") jobId: Int): List<Application>

    @PATCH("jobs/applications/{applicationId}")
    suspend fun updateApplicationStatus(
        @Path("applicationId") applicationId: Int,
        @Body body: StatusUpdate,
    ): Application

    // ── Job matching (Phase 4) ──
    @GET("jobs/match")
    suspend fun jobMatches(@Query("limit") limit: Int = 4): MatchResponse

    // ── Visa checklist (Phase 4) ──
    @GET("visa/destinations")
    suspend fun visaDestinations(): DestinationsResponse

    @GET("visa/checklist")
    suspend fun visaChecklist(
        @Query("destination") destination: String,
        @Query("visa_type") visaType: String,
        @Query("situation") situation: String? = null,
    ): VisaChecklist

    // ── Community chat (Phase 4) ──
    @GET("community/rooms")
    suspend fun communityRooms(): CommunityRoomsResponse

    @GET("community/history/{room}")
    suspend fun communityHistory(@Path("room") room: String): CommunityHistory

    // ── University housing (Phase 4) ──
    @GET("housing/providers")
    suspend fun housingProviders(): ProvidersResponse

    @GET("housing/availability")
    suspend fun housingAvailability(
        @Query("university") university: String,
        @Query("provider_id") providerId: String = "demo",
    ): AvailabilityResponse

    // ── Password reset (Phase 4) ──
    @POST("auth/password-reset")
    suspend fun requestPasswordReset(@Body body: PasswordResetRequest): MessageResponse
}
