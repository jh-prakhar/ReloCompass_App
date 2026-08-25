package com.relocompass.app.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.relocompass.app.ui.theme.*

/** Bottom navigation bar shown on every authenticated screen. */
@Composable
fun ReloBottomBar(
    currentRoute: String?,
    isEmployer: Boolean,
    onSelect: (String) -> Unit,
) {
    val items = buildList {
        add(Triple("dashboard", "Home", IconsHome))
        add(Triple("jobs", "Jobs", IconsJobs))
        add(Triple("community", "Chat", IconsChat))
        if (!isEmployer) add(Triple("visa", "Visa", IconsVisa))
        if (isEmployer) add(Triple("employer", "Hiring", IconsHiring))
        add(Triple("profile", "Profile", IconsProfile))
    }
    NavigationBar {
        items.forEach { (route, label, icon) ->
            NavigationBarItem(
                selected = currentRoute == route,
                onClick = { onSelect(route) },
                icon = { Icon(icon, contentDescription = label) },
                label = { Text(label, maxLines = 1) },
            )
        }
    }
}
