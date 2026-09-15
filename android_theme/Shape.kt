package com.saa.controlederegistro.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

// Formas geométricas sob medida (cantos moderados para estética premium, limpa e corporativa)
val Shapes = Shapes(
    // Badges, Chips de Filtros e Botões Pequenos
    small = RoundedCornerShape(6.dp),
    
    // Cards de Registros, Campos de Entrada (Inputs) e Itens de Listas
    medium = RoundedCornerShape(10.dp),
    
    // Diálogos de Confirmação, Bottom Sheets e Modais Suspensos
    large = RoundedCornerShape(14.dp)
)
