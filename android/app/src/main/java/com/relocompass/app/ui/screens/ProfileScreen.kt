package com.relocompass.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.relocompass.app.api.ProfileUpdate
import com.relocompass.app.data.SessionViewModel
import com.relocompass.app.ui.components.AppScaffold
import com.relocompass.app.ui.components.PrimaryButton
import com.relocompass.app.ui.theme.Blue
import com.relocompass.app.ui.theme.Slate600

@Composable
fun ProfileScreen(session: SessionViewModel, navigate: (String) -> Unit = { }) {
    val user = session.state.collectAsState().value.user ?: return
    var name by remember(user.id) { mutableStateOf(user.name) }
    var phone by remember(user.id) { mutableStateOf(user.phone ?: "") }
    var country by remember(user.id) { mutableStateOf(user.country ?: "") }
    var city by remember(user.id) { mutableStateOf(user.city ?: "") }
    var bio by remember(user.id) { mutableStateOf(user.bio ?: "") }
    var saved by remember { mutableStateOf(false) }

    AppScaffold(
        title = "My Profile",
        currentRoute = "profile",
        isEmployer = user.role == "employer",
        onSelect = navigate,
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
        ) {
            Text(user.email, color = Slate600, fontSize = 13.sp)
            Text(
                user.role.replaceFirstChar { it.uppercase() } + " account",
                color = Blue,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(Modifier.height(20.dp))

            OutlinedTextField(value = name, onValueChange = { name = it; saved = false },
                label = { Text("Full name") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(value = phone, onValueChange = { phone = it; saved = false },
                label = { Text("Phone") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(value = country, onValueChange = { country = it; saved = false },
                label = { Text("Destination country") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(value = city, onValueChange = { city = it; saved = false },
                label = { Text("Destination city") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(value = bio, onValueChange = { bio = it; saved = false },
                label = { Text("About you (feeds the AI assistant's context)") },
                modifier = Modifier.fillMaxWidth(), minLines = 3)

            Spacer(Modifier.height(20.dp))
            PrimaryButton(
                text = if (saved) "Saved ✓" else "Save changes",
                onClick = {
                    session.updateProfile(
                        ProfileUpdate(
                            name = name.trim().ifBlank { null },
                            phone = phone.trim().ifBlank { null },
                            country = country.trim().ifBlank { null },
                            city = city.trim().ifBlank { null },
                            bio = bio.trim().ifBlank { null },
                        )
                    ) { ok -> saved = ok }
                },
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(24.dp))
            OutlinedButton(
                onClick = { session.logout() },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Log out", color = MaterialTheme.colorScheme.error) }
        }
    }
}
