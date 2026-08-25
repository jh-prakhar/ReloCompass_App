package com.relocompass.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.relocompass.app.api.ApiClient
import com.relocompass.app.api.AvailabilityResponse
import com.relocompass.app.api.HousingProvider
import com.relocompass.app.api.apiCall
import com.relocompass.app.data.SessionViewModel

/**
 * University housing availability: provider → university → live options.
 * Demo provider data today; real university APIs plug into the same interface.
 */
@Composable
fun HousingScreen(session: SessionViewModel) {
    var providers by remember { mutableStateOf<List<HousingProvider>>(emptyList()) }
    var provider by remember { mutableStateOf<HousingProvider?>(null) }
    var university by remember { mutableStateOf<String?>(null) }

    var result by remember { mutableStateOf<AvailabilityResponse?>(null) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        apiCall { ApiClient.api.housingProviders() }
            .onSuccess {
                providers = it.providers
                provider = it.providers.firstOrNull()
                university = it.providers.firstOrNull()?.universities?.firstOrNull()
            }
            .onFailure { error = it.message }
    }

    LaunchedEffect(provider?.id, university) {
        val uni = university ?: return@LaunchedEffect
        val pid = provider?.id ?: return@LaunchedEffect
        loading = true; error = null; result = null
        apiCall { ApiClient.api.housingAvailability(uni, pid) }
            .onSuccess { result = it }
            .onFailure { error = it.message }
        loading = false
    }

    Column(Modifier.fillMaxSize()) {
        Text(
            "University Housing",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 4.dp),
        )
        Text(
            "Availability from ${provider?.label ?: "providers"} (demo data — real university APIs coming)",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(horizontal = 16.dp),
        )

        Row(
            Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            DropdownPicker(
                label = "University",
                selected = university,
                options = (provider?.universities ?: emptyList()).map { it to it },
                modifier = Modifier.weight(1f),
                onSelected = { university = it },
            )
            DropdownPicker(
                label = "Provider",
                selected = provider?.label,
                options = providers.map { it.label to it },
                modifier = Modifier.weight(1f),
                onSelected = {
                    provider = it
                    university = it.universities.firstOrNull()
                },
            )
        }

        when {
            loading -> Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
            error != null -> Text(
                error!!,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(16.dp),
            )
            result != null -> {
                val res = result!!
                Text(
                    "${res.count} option${if (res.count == 1) "" else "s"} · ${res.university}",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
                )
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    items(res.options, key = { it.title + it.kind + it.monthlyCost.toString() }) { opt ->
                        Card {
                            Column(Modifier.fillMaxWidth().padding(14.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        opt.title,
                                        fontWeight = FontWeight.SemiBold,
                                        modifier = Modifier.weight(1f),
                                    )
                                    AssistChip(onClick = {}, label = { Text(opt.kind.replace('_', ' ')) })
                                }
                                Text(
                                    "${"%,.0f".format(opt.monthlyCost)} ${opt.currency} / month",
                                    style = MaterialTheme.typography.titleSmall,
                                    color = MaterialTheme.colorScheme.primary,
                                )
                                val details = buildList {
                                    opt.availableFrom?.let { add("From $it") }
                                    opt.distanceKm?.let { add("· $it km from campus") }
                                    if (opt.mealsIncluded) add("· meals included")
                                }
                                if (details.isNotEmpty()) {
                                    Text(details.joinToString(" "), style = MaterialTheme.typography.bodySmall)
                                }
                                opt.notes?.let {
                                    Text(
                                        it,
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
