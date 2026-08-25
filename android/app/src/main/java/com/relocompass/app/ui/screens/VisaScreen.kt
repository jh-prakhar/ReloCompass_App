package com.relocompass.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.relocompass.app.api.ApiClient
import com.relocompass.app.api.apiCall
import com.relocompass.app.api.VisaChecklist
import com.relocompass.app.api.VisaDestination
import com.relocompass.app.data.SessionViewModel

/**
 * Visa checklist generator: destination → visa type → situation → phased,
 * checkable document list with progress and official-source links.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VisaScreen(session: SessionViewModel, navigate: (String) -> Unit) {
    var destinations by remember { mutableStateOf<List<VisaDestination>>(emptyList()) }
    var loadError by remember { mutableStateOf<String?>(null) }

    var destination by remember { mutableStateOf<VisaDestination?>(null) }
    var visaType by remember { mutableStateOf<String?>(null) }
    var situation by remember { mutableStateOf<String?>(null) }

    var checklist by remember { mutableStateOf<VisaChecklist?>(null) }
    var checking by remember { mutableStateOf(false) }
    var checklistError by remember { mutableStateOf<String?>(null) }
    val checked = remember(checklist) { mutableStateMapOf<String, Boolean>() }
    var expandedPhase by remember(checklist) { mutableStateOf<String?>(checklist?.checklist?.firstOrNull()?.phase) }

    LaunchedEffect(Unit) {
        apiCall { ApiClient.api.visaDestinations() }
            .onSuccess { destinations = it.destinations }
            .onFailure { loadError = it.message }
    }

    LaunchedEffect(destination?.id, visaType, situation) {
        val dest = destination ?: return@LaunchedEffect
        val vt = visaType ?: return@LaunchedEffect
        checking = true; checklistError = null; checklist = null
        apiCall { ApiClient.api.visaChecklist(dest.id, vt, situation) }
            .onSuccess {
                checklist = it
                checked.clear()
                expandedPhase = it.checklist.firstOrNull()?.phase
            }
            .onFailure { checklistError = it.message }
        checking = false
    }

    val situations = listOf("student", "job_seeker", "family", "with_kids")

    Column(Modifier.fillMaxSize()) {
        Text(
            "Visa Checklist",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 4.dp),
        )
        Text(
            "Documents for your destination, visa type and situation",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(horizontal = 16.dp),
        )

        when {
            loadError != null -> ErrorPane(loadError!!)
            destinations.isEmpty() && loadError == null -> Box(
                Modifier.fillMaxSize().padding(32.dp),
                contentAlignment = Alignment.Center,
            ) { CircularProgressIndicator() }

            else -> {
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    DropdownPicker(
                        label = "Destination",
                        selected = destination?.label,
                        options = destinations.map { it.label to it },
                        modifier = Modifier.weight(1f),
                        onSelected = {
                            destination = it
                            visaType = it.visaTypes.firstOrNull()?.id
                        },
                    )
                    DropdownPicker(
                        label = "Visa type",
                        selected = destination?.visaTypes?.firstOrNull { v -> v.id == visaType }?.label,
                        options = (destination?.visaTypes ?: emptyList()).map { it.label to it.id },
                        enabled = destination != null,
                        modifier = Modifier.weight(1f),
                        onSelected = { visaType = it },
                    )
                }
                DropdownPicker(
                    label = "Situation (optional)",
                    selected = situation?.replaceFirstChar { it.uppercase() },
                    options = listOf("Any" to null) + situations.map { it.replaceFirstChar { c -> c.uppercase() } to it },
                    modifier = Modifier.padding(horizontal = 16.dp).fillMaxWidth(),
                    onSelected = { situation = it },
                )

                when {
                    checking -> Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                    checklistError != null -> ErrorPane(checklistError!!)
                    checklist != null -> ChecklistBody(
                        checklist = checklist!!,
                        checked = checked,
                        expandedPhase = expandedPhase,
                        onTogglePhase = { expandedPhase = if (expandedPhase == it) null else it },
                        onCheck = { id, v -> checked[id] = v },
                    )
                }
            }
        }
    }
}

@Composable
private fun ChecklistBody(
    checklist: VisaChecklist,
    checked: Map<String, Boolean>,
    expandedPhase: String?,
    onTogglePhase: (String) -> Unit,
    onCheck: (String, Boolean) -> Unit,
) {
    val total = checklist.totalItems.coerceAtLeast(1)
    val done = checklist.checklist.sumOf { p -> p.items.count { checked[it.id] == true } }
    val uriHandler = LocalUriHandler.current

    Column(Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
        Text(
            "$done of ${checklist.totalItems} ready",
            style = MaterialTheme.typography.titleMedium,
            modifier = Modifier.padding(top = 12.dp),
        )
        LinearProgressIndicator(
            progress = { done.toFloat() / total },
            modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        )
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(bottom = 24.dp),
        ) {
            items(checklist.checklist, key = { it.phase }) { phase ->
                val phaseDone = phase.items.count { checked[it.id] == true }
                Card(onClick = { onTogglePhase(phase.phase) }) {
                    Column(Modifier.fillMaxWidth().padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(phase.label, fontWeight = FontWeight.SemiBold)
                                Text(
                                    "$phaseDone / ${phase.items.size} items",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                            Icon(
                                if (expandedPhase == phase.phase) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore,
                                contentDescription = if (expandedPhase == phase.phase) "Collapse" else "Expand",
                            )
                        }
                        AnimatedVisibility(visible = expandedPhase == phase.phase) {
                            Column(Modifier.padding(top = 6.dp)) {
                                phase.items.forEach { item ->
                                    Row(verticalAlignment = Alignment.Top, modifier = Modifier.padding(vertical = 4.dp)) {
                                        Checkbox(
                                            checked = checked[item.id] == true,
                                            onCheckedChange = { onCheck(item.id, it) },
                                        )
                                        Column(Modifier.weight(1f)) {
                                            Text(item.label, fontSize = 15.sp)
                                            if (!item.note.isNullOrBlank()) {
                                                Text(
                                                    item.note,
                                                    style = MaterialTheme.typography.bodySmall,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            item {
                Column(Modifier.padding(vertical = 12.dp)) {
                    checklist.officialSources.forEach { src ->
                        TextButton(onClick = { runCatching { uriHandler.openUri(src) } }) {
                            Text("Official source: ${src.removePrefix("https://").removePrefix("www.")}")
                        }
                    }
                    Text(
                        checklist.disclaimer ?: "",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}

@Composable
private fun ErrorPane(message: String) {
    Column(
        Modifier.fillMaxWidth().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("Couldn't load checklist", fontWeight = FontWeight.SemiBold)
        Text(message, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

/** Simple exposed dropdown used for destination / visa type / situation. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun <T> DropdownPicker(
    label: String,
    selected: String?,
    options: List<Pair<String, T>>,
    enabled: Boolean = true,
    modifier: Modifier = Modifier,
    onSelected: (T) -> Unit,
) {
    var open by remember { mutableStateOf(false) }
    ExposedDropdownMenuBox(
        expanded = open && enabled,
        onExpandedChange = { if (enabled) open = it },
        modifier = modifier,
    ) {
        OutlinedTextField(
            value = selected ?: label,
            onValueChange = {},
            readOnly = true,
            enabled = enabled,
            label = { Text(label) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(open) },
            modifier = Modifier.menuAnchor().fillMaxWidth(),
        )
        ExposedDropdownMenu(expanded = open && enabled, onDismissRequest = { open = false }) {
            options.forEach { (text, value) ->
                DropdownMenuItem(
                    text = { Text(text) },
                    onClick = {
                        open = false
                        onSelected(value)
                    },
                )
            }
        }
    }
}
