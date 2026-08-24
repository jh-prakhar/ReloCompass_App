package com.relocompass.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.relocompass.app.api.ApiClient
import com.relocompass.app.data.TokenStore
import com.relocompass.app.ui.ReloApp
import com.relocompass.app.ui.theme.ReloCompassTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val store = TokenStore(this)
        // TokenStore.peekToken() is a synchronous, memory-cached read (it blocks
        // exactly once, on first call, to hydrate from DataStore).
        ApiClient.init(BuildConfig.API_BASE_URL) { store.peekToken() }
        setContent {
            ReloCompassTheme {
                ReloApp(store)
            }
        }
    }
}
