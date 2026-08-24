package com.relocompass.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.clickable
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.relocompass.app.BuildConfig
import com.relocompass.app.data.SessionViewModel
import com.relocompass.app.ui.components.PrimaryButton
import com.relocompass.app.ui.theme.*

@Composable
fun LoginScreen(session: SessionViewModel, onRegister: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    val state by session.state.collectAsState()

    Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 28.dp, vertical = 48.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text("🧭", fontSize = 56.sp)
            Spacer(Modifier.height(8.dp))
            Text(
                "ReloCompass",
                fontSize = 30.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Navy,
            )
            Text(
                "AI-powered relocation guidance",
                color = Slate600,
                fontSize = 14.sp,
            )
            Spacer(Modifier.height(32.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                shape = MaterialTheme.shapes.medium,
            )
            Spacer(Modifier.height(14.dp))
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    IconButton(onClick = { showPassword = !showPassword }) {
                        Icon(
                            if (showPassword) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                            contentDescription = if (showPassword) "Hide password" else "Show password",
                        )
                    }
                },
                shape = MaterialTheme.shapes.medium,
            )

            state.error?.let {
                Spacer(Modifier.height(12.dp))
                Text(it, color = Red, fontSize = 13.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
            }

            Spacer(Modifier.height(24.dp))
            PrimaryButton(
                text = "Log in",
                onClick = { session.login(email, password) },
                modifier = Modifier.fillMaxWidth(),
                enabled = email.isNotBlank() && password.isNotBlank(),
                busy = state.loading,
            )
            Spacer(Modifier.height(16.dp))
            TextButton(onClick = onRegister) {
                Text("New here? ", color = Slate600)
                Text("Create an account", color = Blue, fontWeight = FontWeight.SemiBold)
            }

            // Demo accounts against the hosted backend.
            // Passwords aren't shipped in source: set demoPassword via Gradle
            // (-PdemoPassword=... or local.properties DEMO_PASSWORD=...) for a
            // demo build; the chips prefill the email only.
            val demoPassword = BuildConfig.DEMO_PASSWORD
            Spacer(Modifier.height(20.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.surfaceVariant)
            Spacer(Modifier.height(12.dp))
            Text("Demo accounts (hosted backend)", fontSize = 11.sp, color = Slate400)
            Spacer(Modifier.height(8.dp))
            listOf(
                "Student" to "student@relocompass.org",
                "Job seeker" to "jobseeker@relocompass.org",
                "Employer" to "employer@relocompass.org",
            ).forEach { (label, mail) ->
                Row(
                    Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .clickable {
                            email = mail
                            if (demoPassword.isNotBlank()) password = demoPassword
                        }
                        .padding(vertical = 8.dp, horizontal = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(label, fontSize = 12.sp, fontWeight = FontWeight.Medium, modifier = Modifier.width(90.dp))
                    Text(mail, fontSize = 12.sp, color = Blue)
                }
            }
        }
    }
}

@Composable
fun RegisterScreen(session: SessionViewModel, onBack: () -> Unit) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var role by remember { mutableStateOf("student") }
    val state by session.state.collectAsState()

    val roles = listOf(
        "student" to "Student",
        "job_seeker" to "Job seeker",
        "employer" to "Employer",
    )

    Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 28.dp, vertical = 40.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
                Text("Create your account", fontSize = 20.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(24.dp))

            OutlinedTextField(
                value = name, onValueChange = { name = it },
                label = { Text("Full name") }, singleLine = true,
                modifier = Modifier.fillMaxWidth(), shape = MaterialTheme.shapes.medium,
            )
            Spacer(Modifier.height(14.dp))
            OutlinedTextField(
                value = email, onValueChange = { email = it },
                label = { Text("Email") }, singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                shape = MaterialTheme.shapes.medium,
            )
            Spacer(Modifier.height(14.dp))
            OutlinedTextField(
                value = password, onValueChange = { password = it },
                label = { Text("Password (min 6 characters)") }, singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = PasswordVisualTransformation(),
                shape = MaterialTheme.shapes.medium,
            )

            Spacer(Modifier.height(18.dp))
            Text("I am a…", modifier = Modifier.fillMaxWidth(), color = Slate600, fontSize = 13.sp)
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                roles.forEach { (key, label) ->
                    FilterChip(
                        selected = role == key,
                        onClick = { role = key },
                        label = { Text(label, fontSize = 12.sp) },
                        modifier = Modifier.weight(1f),
                    )
                }
            }

            state.error?.let {
                Spacer(Modifier.height(12.dp))
                Text(it, color = Red, fontSize = 13.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
            }

            Spacer(Modifier.height(24.dp))
            PrimaryButton(
                text = "Create account",
                onClick = { session.register(name, email, password, role) },
                modifier = Modifier.fillMaxWidth(),
                enabled = name.length >= 2 && email.isNotBlank() && password.length >= 6,
                busy = state.loading,
            )
        }
    }
}
