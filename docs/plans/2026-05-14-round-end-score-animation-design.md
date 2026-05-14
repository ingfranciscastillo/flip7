# Design: Animación de Puntuaciones al Final de Ronda

## Overview

Implementar una animación fluida para mostrar las puntuaciones al final de cada ronda: después del overlay "¡RONDA COMPLETA!", aparece el cuadro de puntuaciones con number ticker (0 → score anterior → score actual) para cada jugador.

## Problema Actual

- El score pop aparece inmediatamente cuando cambia el `totalScore`, sin sincronización con el flujo visual
- El cuadro de puntuaciones aparece de forma estática sin animación
- No hay forma de ver el incremento de puntos de forma clara

## Solución Propuesta

### Flujo Visual

1. **T+0s**: Acaba la ronda, aparece overlay "¡RONDA COMPLETA!" (dura ~3s)
2. **T+2.5s**: Desaparece overlay, aparece cuadro de puntuaciones
3. **T+2.5s - T+4.5s**: Cada ScoreRow anima su puntuación con number ticker
4. **T+4.5s+**: Cuadro visible, listo para siguiente ronda

### Componente ScoreRow

```tsx
interface ScoreRowProps {
  previousScore: number;
  currentScore: number;
  player: { name: string; emoji: string };
  delay: number; // stagger delay
}
```

**Comportamiento del number ticker**:

- Fase 1 (0-500ms): Cuenta de 0 a `previousScore`
- Pausa breve (100ms)
- Fase 2 (500-1000ms): Cuenta de `previousScore` a `currentScore`
- Si `currentScore > previousScore`: mostrar "+X" flotante al final
- Stagger: 100ms entre cada ScoreRow

### Timing Detallado

| Tiempo | Evento                                     |
| ------ | ------------------------------------------ |
| 0s     | Overlay "¡RONDA COMPLETA!" aparece         |
| ~2.5s  | Overlay termina, cuadro de scores aparece  |
| 2.5s   | Primer jugador empieza ticker (delay: 0ms) |
| 2.6s   | Segundo jugador (delay: 100ms)             |
| ...    | ...                                        |
| ~4.5s  | Todos los tickers completados              |

### Consideraciones Técnicas

- El `previousScore` debe calcularse en base al `currentScore - roundScore`
- El servidor ya envía `scores` en el evento `round:ended` (ver handlers.ts línea 48)
- Usar Framer Motion para las animaciones (ya está en el proyecto)
- El componente debe ser reutilizable para `game-over` si se desea

## Implementación

### Archivos a modificar/crear

1. `apps/web/app/components/ScoreRow.tsx` (nuevo)
   - Componente que maneja la animación del number ticker
   - Props: previousScore, currentScore, player, delay

2. `apps/web/app/routes/game.tsx`
   - Importar ScoreRow
   - Calcular previousScore desde los datos del evento round:ended
   - Reemplazar el mapeo actual de players por ScoreRow

3. `apps/web/app/store/gameStore.ts` (opcional)
   - Si se necesita storing del previousScore, agregar aquí
   - Por ahora puede pasarse directamente como prop

### Server Data

El servidor ya envía en `round:ended`:

```typescript
{ round: ..., scores: [{ playerId, score, totalScore }] }
```

Podemos usar esto para calcular el `previousScore` = `totalScore - score`.

## Success Criteria

- [ ] Overlay "¡RONDA COMPLETA!" aparece primero
- [ ] Cuadro de puntuaciones aparece después del overlay
- [ ] Cada puntuación anima con number ticker (0 → anterior → actual)
- [ ] El incremento (+X) se muestra como浮动 tras el ticker
- [ ] Stagger entre jugadores (100ms)
- [ ] Timing fluido y sensación de progresión
- [ ] works en móvil y desktop
