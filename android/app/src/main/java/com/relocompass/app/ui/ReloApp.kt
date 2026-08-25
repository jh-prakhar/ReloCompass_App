package com.relocompass.app.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.relocompass.app.data.SessionViewModel
import com.relocompass.app.data.TokenStore
import com.relocompass.app.ui.screens.*

/**
 * Root composable: auth gate + navigation.
 * Shows a splash while restoring the session, then Login or the main app.
 */
@Composable
fun ReloApp(store: TokenStore) {
    val session: SessionViewModel = viewModel { SessionViewModel(store) }
    val state by session.state.collectAsState()

    LaunchedEffect(Unit) { session.bootstrap() }

    when {
        !state.bootstrapped -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        !state.loggedIn -> AuthNav(session)
        else -> MainNav(session, store)
    }
}

@Composable
private fun AuthNav(session: SessionViewModel) {
    val nav = rememberNavController()
    NavHost(navController = nav, startDestination = "login") {
        composable("login") { LoginScreen(session, onRegister = { session.clearError(); nav.navigate("register") }) }
        composable("register") { RegisterScreen(session, onBack = { session.clearError(); nav.popBackStack() }) }
    }
}

@Composable
private fun MainNav(session: SessionViewModel, store: TokenStore) {
    val nav = rememberNavController()
    NavHost(navController = nav, startDestination = "dashboard") {
        composable("dashboard") { DashboardScreen(session, navigate = { navigateFromBar(nav, it) }) }
        composable("assistant") { AssistantScreen(session, store, navigate = { navigateFromBar(nav, it) }) }
        composable("jobs") { JobsScreen(session, navigate = { navigateFromBar(nav, it) }) }
        composable("applications") { ApplicationsScreen(session, navigate = { navigateFromBar(nav, it) }) }
        composable("employer") { EmployerScreen(session, navigate = { navigateFromBar(nav, it) }) }
        composable("visa") { VisaScreen(session, navigate = { navigateFromBar(nav, it) }) }
        composable("community") { CommunityScreen(session, store) }
        composable("housing") { HousingScreen(session) }
        composable("profile") { ProfileScreen(session, navigate = { navigateFromBar(nav, it) }) }
    }
}

/** Single bottom-nav navigation entry point: avoid stacking duplicate destinations. */
fun navigateFromBar(nav: NavHostController, route: String) {
    nav.navigate(route) {
        popUpTo("dashboard") { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
}
