package com.saa.controlederegistro.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = OuroVelhoPrimario,
    onPrimary = Color(0xFF000000),             // Texto preto sobre o botão dourado sólido
    primaryContainer = OuroVelhoEscuro,
    onPrimaryContainer = TextoPrincipal,
    
    secondary = ChampagneMetalico,
    onSecondary = Color(0xFF000000),
    
    background = BackgroundGrafite,            // Fundo escuro sutil nível 0
    onBackground = TextoPrincipal,
    
    surface = SurfaceGrafiteCard,              // Fundo sutil nível 1 para cards
    onSurface = TextoPrincipal,
    
    surfaceVariant = SurfaceGrafiteElevated,    // Fundo sutil nível 2 para inputs/modais
    onSurfaceVariant = TextoPrincipal,
    
    outline = BordaSutil,                      // Linhas de contorno finas e planas
    outlineVariant = BordaFoco,
    
    error = VermelhoSutil,
    onError = Color.White
)

@Composable
fun SAAControleRegistroTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}
