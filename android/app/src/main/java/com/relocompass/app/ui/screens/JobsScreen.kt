package com.relocompass.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.relocompass.app.api.ApiClient
import com.relocompass.app.api.Job
import com.relocompass.app.data.SessionViewModel
import androidx.compose.foundation.verticalScroll
import com.relocompass.app.api.ApplyRequest
import com.relocompass.app.api.apiCall
import com.relocompass.app.ui.components.AppScaffold
import com.relocompass.app.ui.components.VisaPill
import com.relocompass.app.ui.components.Pill
import com.relocompass.app.ui.theme.Slate400
import com.relocompass.app.ui.theme.Slate600
import kotlinx.coroutines.launch

@Composable
fun JobsScreen(session: SessionViewModel, navigate: (String) -> Unit = { }) {
    val user = session.state.collectAsState().value.user
    val isEmployer = user?.role == "employer"
    val scope = rememberCoroutineScope()
    var jobs by remember { mutableStateOf<List<Job>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var selected by remember { mutableStateOf<Job?>(null) }
    var q by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var jobType by remember { mutableStateOf("") }
    var visaOnly by remember { mutableStateOf(false) }

    fun reload() {
        scope.launch {
            val result = apiCall {
                ApiClient.api.jobs(
                    q = q.trim().ifBlank { null },
                    location = location.trim().ifBlank { null },
                    visaOnly = visaOnly,
                    jobType = jobType.trim().ifBlank { null },
                )
            }
            jobs = result.getOrNull()
            error = if (jobs == null) result.exceptionOrNull()?.message else null
        }
    }

    LaunchedEffect(Unit) { reload() }

    selected?.let { job ->
        JobDetailDialog(
            job = job,
            isEmployer = isEmployer,
            onDismiss = { selected = null },
            onApplied = { selected = null; reload() },
        )
    }

    AppScaffold(
        title = "Jobs Abroad",
        currentRoute = "jobs",
        isEmployer = user?.role == "employer",
        onSelect = navigate,
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            // Filters
            Column(Modifier.padding(horizontal = 16.dp, vertical = 10.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = q, onValueChange = { q = it },
                        placeholder = { Text("Search title / company") },
                        modifier = Modifier.weight(1f), singleLine = true,
                    )
                }
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = location, onValueChange = { location = it },
                        placeholder = { Text("Location") },
                        modifier = Modifier.weight(1f), singleLine = true,
                    )
                    FilterChip(
                        selected = visaOnly,
                        onClick = { visaOnly = !visaOnly },
                        label = { Text("Visa sponsorship") },
                    )
                    FilledTonalButton(onClick = { reload() }) { Text("Search") }
                }
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
                    listOf("", "full-time", "part-time", "contract", "internship").forEach { type ->
                        val selectedType = jobType == type
                        FilterChip(
                            selected = selectedType,
                            onClick = {
                                jobType = if (selectedType) "" else type
                                reload()
                            },
                            label = {
                                Text(
                                    if (type.isEmpty()) "Any type" else type.replaceFirstChar { it.uppercase() },
                                    fontSize = 11.sp,
                                )
                            },
                        )
                    }
                }
            }

            when {
                error != null -> EmptyState("Couldn't load jobs", error)
                jobs == null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
                jobs!!.isEmpty() -> EmptyState("No jobs found", "Try clearing the filters.")
                else -> LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(jobs!!, key = { it.id }) { job ->
                        JobCard(job) { selected = job }
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyState(title: String, subtitle: String?) {
    Column(
        Modifier.fillMaxSize().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("🧭", fontSize = 40.sp)
        Spacer(Modifier.height(8.dp))
        Text(title, fontWeight = FontWeight.SemiBold)
        subtitle?.let { Text(it, color = Slate600, fontSize = 13.sp) }
    }
}

@Composable
private fun JobCard(job: Job, onClick: () -> Unit) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(job.title, fontWeight = FontWeight.Bold, fontSize = 15.sp, modifier = Modifier.weight(1f))
                Text("#${job.id}", color = Slate400, fontSize = 12.sp)
            }
            Text(job.company, color = Slate600, fontSize = 13.sp)
            Spacer(Modifier.height(6.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                job.location?.let { Pill(it) }
                job.jobType?.let { Pill(it) }
                if (job.visaSponsorship) VisaPill()
            }
        }
    }
}

@Composable
private fun JobDetailDialog(
    job: Job,
    isEmployer: Boolean,
    onDismiss: () -> Unit,
    onApplied: () -> Unit,
) {
    var coverLetter by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var result by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    AlertDialog(
        onDismissRequest = { if (!busy) onDismiss() },
        title = { Text(job.title) },
        text = {
            Column(Modifier.verticalScroll(androidx.compose.foundation.rememberScrollState())) {
                Text(job.company, color = Slate600, fontSize = 13.sp)
                job.location?.let { Text("📍 $it", fontSize = 13.sp) }
                job.jobType?.let { Text("💼 ${it.replaceFirstChar { c -> c.uppercase() }}", fontSize = 13.sp) }
                if (job.visaSponsorship) Text("✅ Offers visa sponsorship", fontSize = 13.sp)
                job.experienceYears?.let { Text("Experience: $it", fontSize = 13.sp) }
                Spacer(Modifier.height(10.dp))
                job.description?.let {
                    Text(it, fontSize = 13.sp)
                    Spacer(Modifier.height(10.dp))
                }

                result?.let { r ->
                    Surface(
                        color = MaterialTheme.colorScheme.secondaryContainer,
                        shape = RoundedCornerShape(10.dp),
                    ) {
                        Text(r, Modifier.padding(10.dp), fontSize = 13.sp)
                    }
                } ?: run {
                    if (isEmployer) {
                        // Employers browse the board but cannot apply.
                        Surface(
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            shape = RoundedCornerShape(10.dp),
                        ) {
                            Text(
                                "Employer account — switch to a student/job-seeker account to apply.",
                                Modifier.padding(10.dp),
                                fontSize = 12.sp,
                                color = Slate600,
                            )
                        }
                    } else {
                        Text("Cover letter (optional)", fontSize = 12.sp, color = Slate600)
                        Spacer(Modifier.height(6.dp))
                        OutlinedTextField(
                            value = coverLetter, onValueChange = { coverLetter = it },
                            modifier = Modifier.fillMaxWidth().heightIn(min = 100.dp),
                            placeholder = { Text("Why are you a great fit?") },
                        )
                    }
                }
            }
        },
        confirmButton = {
            if (result == null) {
                if (isEmployer) {
                    TextButton(onClick = onDismiss) { Text("Close") }
                } else {
                    Button(
                        onClick = {
                            busy = true
                            scope.launch {
                                val res = apiCall { ApiClient.api.apply(job.id, ApplyRequest(coverLetter.trim().ifBlank { null })) }
                                busy = false
                                result = res.getOrNull()?.let { "Application sent ✓ Track it under My Applications." }
                                    ?: (res.exceptionOrNull()?.message ?: "Failed to apply")
                            }
                        },
                        enabled = !busy,
                    ) { Text(if (busy) "Sending…" else "Apply") }
                }
            } else {
                TextButton(onClick = onApplied) { Text("Done") }
            }
        },
        dismissButton = {
            if (!busy && result == null) TextButton(onClick = onDismiss) { Text("Close") }
        },
    )
}
