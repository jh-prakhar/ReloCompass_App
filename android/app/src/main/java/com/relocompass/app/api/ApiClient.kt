package com.relocompass.app.api

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import retrofit2.HttpException
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object GsonHolder {
    val gson: Gson = GsonBuilder().create()
}

class AuthInterceptor(private val tokenProvider: () -> String?) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokenProvider()
        val request = if (token.isNullOrBlank()) {
            chain.request()
        } else {
            chain.request().newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        }
        return chain.proceed(request)
    }
}

/** Wraps Retrofit/OkHttp so suspend calls throw [ApiException] with a readable message. */
object ApiClient {

    lateinit var api: ReloApi
        private set
    lateinit var chat: ChatApi
        private set

    /** Raw base (no trailing slash), e.g. https://host — used to build the WS URL. */
    var webSocketBase: String = ""
        private set

    @Volatile private var tokenProvider: () -> String? = { null }

    fun init(baseUrl: String, tokenProvider: () -> String?) {
        require(baseUrl.isNotBlank()) {
            "API_BASE_URL is not configured. Build with -PapiBaseUrl=https://<host> " +
                "or set API_BASE_URL in local.properties (see android/README.md)."
        }
        this.tokenProvider = tokenProvider
        this.webSocketBase = baseUrl.trimEnd('/')
        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(this.tokenProvider))
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .pingInterval(30, TimeUnit.SECONDS) // keeps community WS alive behind NATs
            .build()

        fun buildRetrofit(path: String) = Retrofit.Builder()
            .baseUrl(ensureTrailingSlash(baseUrl) + path)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create(GsonHolder.gson))
            .build()

        api = buildRetrofit("api/").create(ReloApi::class.java)
        chat = buildRetrofit("api/").create(ChatApi::class.java)
    }

    private fun ensureTrailingSlash(u: String) = if (u.endsWith("/")) u else "$u/"
}

/** Convert any thrown Retrofit error into an [ApiException] with a friendly message. */
suspend fun <T> apiCall(block: suspend () -> T): Result<T> = try {
    Result.success(block())
} catch (e: HttpException) {
    Result.failure(ApiException(e.code(), Errors.parse(e.code(), e.response()?.errorBody()?.string())))
} catch (e: ApiException) {
    Result.failure(e)
} catch (e: Exception) {
    Result.failure(ApiException(-1, "Network error — check your connection and try again"))
}
