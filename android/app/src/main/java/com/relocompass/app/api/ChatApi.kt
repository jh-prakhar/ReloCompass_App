package com.relocompass.app.api

import retrofit2.http.*

/** Chat endpoints live under /api/chat (same base as the v1-style routers). */
interface ChatApi {

    @POST("chat/")
    suspend fun chat(@Body body: ChatRequest): ChatResponse

    @GET("chat/history/{sessionId}")
    suspend fun history(@Path("sessionId") sessionId: String): ChatHistory

    @DELETE("chat/history/{sessionId}")
    suspend fun clearHistory(@Path("sessionId") sessionId: String): MessageResponse
}
