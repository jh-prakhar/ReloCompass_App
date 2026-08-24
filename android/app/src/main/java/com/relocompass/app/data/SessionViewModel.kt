package com.relocompass.app.data

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.relocompass.app.api.ApiClient
import com.relocompass.app.api.User
import com.relocompass.app.api.LoginRequest
import com.relocompass.app.api.ProfileUpdate
import com.relocompass.app.api.RegisterRequest
import com.relocompass.app.api.ApiException
import com.relocompass.app.api.apiCall
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

/** Holds the logged-in user + auth state. One instance shared across the app. */
class SessionViewModel(private val store: TokenStore) : ViewModel() {

    data class UiState(
        val loading: Boolean = false,
        val loggedIn: Boolean = false,
        val bootstrapped: Boolean = false,
        val user: User? = null,
        val error: String? = null,
    )

    private val _state = MutableStateFlow(UiState())
    val state: StateFlow<UiState> = _state

    fun bootstrap() {
        if (_state.value.bootstrapped) return
        viewModelScope.launch {
            val token = store.peekToken()
            if (token.isNullOrBlank()) {
                _state.value = UiState(bootstrapped = true)
                return@launch
            }
            val result = apiCall { ApiClient.api.me() }
            val me = result.getOrNull()
            _state.value = if (me != null) {
                UiState(bootstrapped = true, loggedIn = true, user = me)
            } else {
                // Token invalid — wipe it so the user lands on login.
                store.clear()
                UiState(bootstrapped = true)
            }
        }
    }

    fun login(email: String, password: String, onDone: (Boolean) -> Unit = {}) {
        _state.value = UiState(loading = true)
        viewModelScope.launch {
            val result = apiCall { ApiClient.api.login(LoginRequest(email.trim(), password)) }
            val body = result.getOrNull()
            if (body != null) {
                store.saveSession(body.accessToken, body.user.name, body.user.email, body.user.role)
                _state.value = UiState(loggedIn = true, user = body.user)
                onDone(true)
            } else {
                _state.value = UiState(error = result.exceptionOrNull()?.message ?: "Login failed")
                onDone(false)
            }
        }
    }

    fun register(name: String, email: String, password: String, role: String, onDone: (Boolean) -> Unit = {}) {
        _state.value = UiState(loading = true)
        viewModelScope.launch {
            val result = apiCall {
                ApiClient.api.register(RegisterRequest(name.trim(), email.trim(), password, role))
            }
            val body = result.getOrNull()
            if (body != null) {
                store.saveSession(body.accessToken, body.user.name, body.user.email, body.user.role)
                _state.value = UiState(loggedIn = true, user = body.user)
                onDone(true)
            } else {
                _state.value = UiState(error = result.exceptionOrNull()?.message ?: "Registration failed")
                onDone(false)
            }
        }
    }

    fun updateProfile(update: ProfileUpdate, onDone: (Boolean) -> Unit = {}) {
        viewModelScope.launch {
            val result = apiCall { ApiClient.api.updateProfile(update) }
            val me = result.getOrNull()
            if (me != null) {
                _state.value = _state.value.copy(user = me)
                onDone(true)
            } else {
                _state.value = _state.value.copy(error = result.exceptionOrNull()?.message)
                onDone(false)
            }
        }
    }

    fun logout(onDone: () -> Unit = {}) {
        viewModelScope.launch {
            try { ApiClient.api.logout() } catch (_: Exception) { /* local sign-out anyway */ }
            store.clear()
            _state.value = UiState(bootstrapped = true)
            onDone()
        }
    }

    fun clearError() {
        _state.value = _state.value.copy(error = null)
    }
}
