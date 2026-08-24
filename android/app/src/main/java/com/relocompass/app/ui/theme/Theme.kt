package com.relocompass.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Brand palette — mirrors the web app.
val Navy = Color(0xFF0F172A)
val NavySoft = Color(0xFF1E293B)
val Cream = Color(0xFFF6EFE2)
val Blue = Color(0xFF3B82F6)
val Cyan = Color(0xFF06B6D4)
val Slate100 = Color(0xFFF1F5F9)
val Slate400 = Color(0xFF94A3B8)
val Slate600 = Color(0xFF475569)
val Green = Color(0xFF10B981)
val Amber = Color(0xFFF59E0B)
val Red = Color(0xFFEF4444)

private val LightColors = lightColorScheme(
    primary = Blue,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFDBEAFE),
    onPrimaryContainer = Color(0xFF1E3A8A),
    secondary = Cyan,
    onSecondary = Color.White,
    tertiary = Color(0xFF8B5CF6),
    background = Slate100,
    onBackground = Navy,
    surface = Color.White,
    onSurface = Navy,
    surfaceVariant = Color(0xFFE2E8F0),
    onSurfaceVariant = Slate600,
    error = Red,
)

private val DarkColors = darkColorScheme(
    primary = Blue,
    onPrimary = Color.White,
    secondary = Cyan,
    tertiary = Color(0xFFA78BFA),
    background = Navy,
    onBackground = Cream,
    surface = NavySoft,
    onSurface = Cream,
    surfaceVariant = Color(0xFF334155),
    onSurfaceVariant = Slate400,
)

@Composable
fun ReloCompassTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        content = content,
    )
}

/** Status color for an application's lifecycle. */
@Composable
fun statusColor(status: String): Color = when (status) {
    "pending" -> Slate400
    "reviewed" -> Blue
    "shortlisted" -> Amber
    "accepted" -> Green
    "rejected" -> Red
    else -> Slate400
}
