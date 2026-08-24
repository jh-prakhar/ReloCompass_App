package com.relocompass.app.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.relocompass.app.ui.theme.Amber
import com.relocompass.app.ui.theme.Blue
import com.relocompass.app.ui.theme.Green
import com.relocompass.app.ui.theme.Red
import com.relocompass.app.ui.theme.Slate400

/** Shared scaffolding for authenticated screens: top bar + bottom nav + FAB slot. */
@Composable
fun AppScaffold(
    title: String,
    currentRoute: String?,
    isEmployer: Boolean,
    onSelect: (String) -> Unit,
    actions: @Composable RowScope.() -> Unit = {},
    floatingActionButton: @Composable () -> Unit = {},
    snackbarHost: @Composable () -> Unit = {},
    content: @Composable (PaddingValues) -> Unit,
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title, fontWeight = FontWeight.Bold) },
                actions = actions,
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                ),
            )
        },
        bottomBar = {
            ReloBottomBar(currentRoute = currentRoute, isEmployer = isEmployer, onSelect = onSelect)
        },
        floatingActionButton = floatingActionButton,
        snackbarHost = snackbarHost,
        content = content,
    )
}

/** Colored pill used for job types, statuses, and badges. */
@Composable
fun Pill(text: String, color: Color = Blue) {
    Surface(
        color = color.copy(alpha = 0.12f),
        contentColor = color,
        shape = RoundedCornerShape(50),
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.SemiBold,
        )
    }
}

@Composable
fun StatusPill(status: String) {
    val color = when (status) {
        "pending" -> Slate400
        "reviewed" -> Blue
        "shortlisted" -> Amber
        "accepted" -> Green
        "rejected" -> Red
        else -> Slate400
    }
    Pill(text = status.replaceFirstChar { it.uppercase() }, color = color)
}

@Composable
fun VisaPill() = Pill(text = "Visa sponsorship", color = Green)

/** Full-width primary CTA button with a busy state. */
@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    busy: Boolean = false,
) {
    Button(
        onClick = onClick,
        enabled = enabled && !busy,
        modifier = modifier.height(52.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Blue),
    ) {
        if (busy) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                color = Color.White,
                strokeWidth = 2.dp,
            )
            Spacer(Modifier.width(8.dp))
        }
        Text(text)
    }
}

@Composable
fun GradientButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    busy: Boolean = false,
) {
    PrimaryButton(text = text, onClick = onClick, modifier = modifier, enabled = enabled, busy = busy)
}
