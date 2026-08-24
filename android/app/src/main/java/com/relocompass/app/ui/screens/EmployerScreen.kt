package com.relocompass.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.relocompass.app.api.ApiClient
import com.relocompass.app.api.JobCreate
import com.relocompass.app.api.Job
import com.relocompass.app.api.Application
import com.relocompass.app.ui.components.StatusPill
import com.relocompass.app.api.StatusUpdate
import com.relocompass.app.api.apiCall
import com.relocompass.app.data.SessionViewModel
import com.relocompass.app.ui.components.AppScaffold
import com.relocompass.app.ui.components.Pill
import com.relocompass.app.ui.theme.Slate600
import kotlinx.coroutines.launch

@Composable
fun EmployerScreen(session: SessionViewModel, navigate: (String) -> Unit = { }) {
    val user = session.state.collectAsState().value.user
    val scope = rememberCoroutineScope()
    var myJobs by remember { mutableStateOf<List<Job>?>(null) }
    var showPost by remember { mutableStateOf(false) }
    var viewApplicants by remember { mutableStateOf<Job?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var actionError by remember { mutableStateOf<String?>(null) }
    val snackbar = remember { SnackbarHostState() }

    fun reload() {
        scope.launch {
            val result = apiCall { ApiClient.api.myJobs() }
            myJobs = result.getOrNull()
            error = if (myJobs == null) result.exceptionOrNull()?.message else null
        }
    }

    fun reportActionError(message: String) {
        actionError = message
        scope.launch { snackbar.showSnackbar(message) }
    }

    LaunchedEffect(Unit) { reload() }

    if (showPost) {
        PostJobDialog(
            onDismiss = { showPost = false },
            onPosted = { showPost = false; reload() },
        )
    }
    viewApplicants?.let { job ->
        ApplicantsDialog(
            job = job,
            onStatusError = ::reportActionError,
            onDismiss = { viewApplicants = null },
        )
    }

    AppScaffold(
        title = "Employer Portal",
        currentRoute = "employer",
        isEmployer = true,
        onSelect = navigate,
        floatingActionButton = {
            if (user?.role == "employer") {
                ExtendedFloatingActionButton(onClick = { showPost = true }) {
                    Text("+ Post a Job")
                }
            }
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        actionError?.let {
            // Keep the error visible below the list until the next successful action.
            Text(
                it,
                color = MaterialTheme.colorScheme.error,
                fontSize = 12.sp,
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }
        if (user?.role != "employer") {
            // Non-employers can look around but not act.
            Column(Modifier.fillMaxSize().padding(padding).padding(32.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                Text("🏢", fontSize = 40.sp)
                Text("For employers", fontWeight = FontWeight.Bold)
                Text("Register an employer account to post jobs and review applicants.", color = Slate600, fontSize = 13.sp)
            }
            return@AppScaffold
        }
        when {
            error != null -> Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(error ?: "", color = MaterialTheme.colorScheme.error)
                    TextButton(onClick = { reload() }) { Text("Retry") }
                }
            }
            myJobs == null -> Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
            myJobs!!.isEmpty() -> Column(
                Modifier.fillMaxSize().padding(padding).padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text("🏢", fontSize = 40.sp)
                Text("No posted jobs yet", fontWeight = FontWeight.SemiBold)
                Text("Tap “+ Post a Job” to publish your first listing.", color = Slate600, fontSize = 13.sp)
            }
            else -> Column(Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp)) {
                Text("My posted jobs", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Spacer(Modifier.height(12.dp))
                myJobs!!.forEach { job ->
                    MyJobRow(
                        job = job,
                        onViewApplicants = { viewApplicants = job },
                        onDelete = {
                            scope.launch {
                                val res = apiCall { ApiClient.api.deleteJob(job.id) }
                                if (res.isSuccess) {
                                    actionError = null
                                } else {
                                    reportActionError(res.exceptionOrNull()?.message ?: "Could not delete job")
                                }
                                reload()
                            }
                        },
                    )
                    Spacer(Modifier.height(12.dp))
                }
            }
        }
    }
}

@Composable
private fun MyJobRow(job: Job, onViewApplicants: () -> Unit, onDelete: () -> Unit) {
    Surface(shape = RoundedCornerShape(16.dp)) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(job.title, fontWeight = FontWeight.Bold, fontSize = 15.sp, modifier = Modifier.weight(1f))
                if (!job.isActive) Pill("Closed") else Pill("Active")
            }
            Text(job.company, color = Slate600, fontSize = 13.sp)
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                TextButton(onClick = onViewApplicants) { Text("Applicants") }
                TextButton(onClick = onDelete, colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)) {
                    Text("Delete")
                }
            }
        }
    }
}

@Composable
private fun PostJobDialog(onDismiss: () -> Unit, onPosted: () -> Unit) {
    var title by remember { mutableStateOf("") }
    var company by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var jobType by remember { mutableStateOf("full-time") }
    var description by remember { mutableStateOf("") }
    var experience by remember { mutableStateOf("") }
    var visa by remember { mutableStateOf(false) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    AlertDialog(
        onDismissRequest = { if (!busy) onDismiss() },
        title = { Text("Post a Job") },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState())) {
                OutlinedTextField(value = title, onValueChange = { title = it },
                    label = { Text("Job title *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = company, onValueChange = { company = it },
                    label = { Text("Company *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = location, onValueChange = { location = it },
                    label = { Text("Location") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = jobType, onValueChange = { jobType = it },
                    label = { Text("Job type (full-time, part-time, contract…)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = experience, onValueChange = { experience = it },
                    label = { Text("Experience (e.g. 2-4 years)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = description, onValueChange = { description = it },
                    label = { Text("Description") }, modifier = Modifier.fillMaxWidth(), minLines = 3)
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = visa, onCheckedChange = { visa = it })
                    Text("Offers visa sponsorship", fontSize = 13.sp)
                }
                error?.let { Text(it, color = MaterialTheme.colorScheme.error, fontSize = 12.sp) }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    busy = true
                    scope.launch {
                        val res = apiCall {
                            ApiClient.api.createJob(
                                JobCreate(
                                    title = title.trim(),
                                    company = company.trim(),
                                    description = description.trim().ifBlank { null },
                                    location = location.trim().ifBlank { null },
                                    jobType = jobType.trim().ifBlank { null },
                                    visaSponsorship = visa,
                                    experienceYears = experience.trim().ifBlank { null },
                                )
                            )
                        }
                        busy = false
                        if (res.isSuccess) onPosted() else error = res.exceptionOrNull()?.message
                    }
                },
                enabled = !busy && title.length >= 3 && company.length >= 2,
            ) { Text(if (busy) "Posting…" else "Post") }
        },
        dismissButton = { if (!busy) TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}

@Composable
private fun ApplicantsDialog(
    job: Job,
    onStatusError: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    var applicants by remember { mutableStateOf<List<Application>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(job.id) {
        val result = apiCall { ApiClient.api.jobApplicants(job.id) }
        applicants = result.getOrNull()
        error = if (applicants == null) result.exceptionOrNull()?.message else null
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Applicants — ${job.title}") },
        text = {
            when {
                error != null -> Text(error ?: "", color = MaterialTheme.colorScheme.error, fontSize = 13.sp)
                applicants == null -> Box(Modifier.fillMaxWidth().height(80.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
                applicants!!.isEmpty() -> Text("No applicants yet.", color = Slate600, fontSize = 13.sp)
                else -> Column(Modifier.verticalScroll(rememberScrollState())) {
                    applicants!!.forEach { app ->
                        ApplicantRow(app, onStatus = { newStatus ->
                            scope.launch {
                                val res = apiCall { ApiClient.api.updateApplicationStatus(app.id, StatusUpdate(newStatus)) }
                                if (res.isFailure) {
                                    onStatusError(res.exceptionOrNull()?.message ?: "Could not update status")
                                }
                                val refreshed = apiCall { ApiClient.api.jobApplicants(job.id) }
                                applicants = refreshed.getOrNull() ?: applicants
                            }
                        })
                        Spacer(Modifier.height(10.dp))
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Close") } },
    )
}

@Composable
private fun ApplicantRow(app: Application, onStatus: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    Surface(shape = RoundedCornerShape(12.dp), color = MaterialTheme.colorScheme.surfaceVariant) {
        Column(Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(app.applicant?.name ?: "Applicant", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                    Text(app.applicant?.email ?: "", fontSize = 12.sp, color = Slate600)
                }
                Box {
                    TextButton(onClick = { expanded = true }) { StatusPill(app.status) }
                    DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                        listOf("pending", "reviewed", "shortlisted", "rejected", "accepted").forEach { s ->
                            DropdownMenuItem(
                                text = { Text(s.replaceFirstChar { it.uppercase() }) },
                                onClick = { expanded = false; onStatus(s) },
                            )
                        }
                    }
                }
            }
            app.applicant?.let { a ->
                listOfNotNull(
                    a.city?.let { "📍 $it" },
                    a.country?.let { "🌍 $it" },
                    a.bio?.let { "📝 ${it.take(120)}" },
                ).forEach {
                    Text(it, fontSize = 12.sp, color = Slate600)
                }
            }
            app.coverLetter?.let {
                Spacer(Modifier.height(6.dp))
                Text("“${it.take(200)}”", fontSize = 12.sp, color = Slate600)
            }
        }
    }
}
