package com.relocompass.app.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext

private val Context.dataStore by preferencesDataStore(name = "relocompass")

/**
 * Token + user session persistence. DataStore is the modern replacement for
 * SharedPreferences; tokens are stored app-private.
 *
 * [cachedToken] mirrors the persisted token in memory so the OkHttp
 * interceptor can read it synchronously without a coroutine scope.
 */
class TokenStore(private val context: Context) {

    private val tokenKey = stringPreferencesKey("access_token")
    private val nameKey = stringPreferencesKey("user_name")
    private val roleKey = stringPreferencesKey("user_role")
    private val emailKey = stringPreferencesKey("user_email")
    private val chatSessionKey = stringPreferencesKey("chat_session_id")

    @Volatile
    private var cachedToken: String? = null
    @Volatile
    private var hydrated = false

    val token = context.dataStore.data.map { it[tokenKey] }
    val userName = context.dataStore.data.map { it[nameKey] }
    val userRole = context.dataStore.data.map { it[roleKey] }
    val userEmail = context.dataStore.data.map { it[emailKey] }

    /**
     * Synchronous token read for the auth interceptor. Blocks at most once
     * (first call after process start) to hydrate from DataStore; afterwards
     * it returns from memory.
     */
    fun peekToken(): String? {
        if (!hydrated) {
            runBlocking {
                withContext(Dispatchers.IO) {
                    cachedToken = context.dataStore.data.first()[tokenKey]
                }
            }
            hydrated = true
        }
        return cachedToken
    }

    suspend fun saveSession(accessToken: String, name: String, email: String, role: String) {
        context.dataStore.edit {
            it[tokenKey] = accessToken
            it[nameKey] = name
            it[roleKey] = role
            it[emailKey] = email
        }
        cachedToken = accessToken
        hydrated = true
    }

    suspend fun chatSessionId(): String? = context.dataStore.data.first()[chatSessionKey]

    suspend fun saveChatSessionId(id: String) {
        context.dataStore.edit { it[chatSessionKey] = id }
    }

    suspend fun clearChatSessionId() {
        context.dataStore.edit { it.remove(chatSessionKey) }
    }

    suspend fun clear() {
        context.dataStore.edit { it.clear() }
        cachedToken = null
    }
}
