# UMBRA: Card Frontier — Registro de continuidad

Actualizado: 2026-10-29

## Fuente de verdad y protocolo

- Repositorio: https://github.com/eltiootaku2020-cmyk/cardwaifu
- Documento de reglas y lore: [CEREBRO_Y_OBRERO.md](./CEREBRO_Y_OBRERO.md)
- Hoja de ruta: [ROADMAP.md](./ROADMAP.md)
- Diseño 2D ligero: [docs/ARTE_PNG_2D_LIGERO.md](./docs/ARTE_PNG_2D_LIGERO.md)
- Análisis de combate: [docs/ANALISIS_DIFICULTAD_JUSTA.md](./docs/ANALISIS_DIFICULTAD_JUSTA.md)
- Rama de trabajo: `work/png-2d-lightweight-mvp`
- Pull request: https://github.com/eltiootaku2020-cmyk/cardwaifu/pull/1 (sigue en borrador; no está integrado en `main`).

## Estado confirmado

### Dirección y alcance
- El MVP es un RPG 2D ligero basado en PNG, CSS y TypeScript; no añadir 3D ni 2.5D realista.
- Los personajes visibles serán waifus; las armas son la única excepción visual.
- El usuario crea las ilustraciones finales. No marcar arte como terminado mientras las entradas del manifiesto estén vacías o falte revisar el encuadre.
- Mantener separadas las decisiones de lore confirmadas y las propuestas narrativas sin aprobar.

### Código ya presente en la rama
- API Express, cliente Vite/TypeScript, bot grammY y almacenamiento SQLite.
- Primera invocación persistente, colección de las cartas obtenidas, vista frontal/reverso y equipamiento inicial.
- Ruta inicial del Bosque Oscuro, eventos de exploración con recompensas persistentes, objetivos del capítulo y bloqueo del jefe hasta cumplir requisitos.
- Combate por turnos en servidor y pruebas de sincronización de Alma/Ánima y acciones obsoletas.
- Sistema de manifiesto para retratos/fondos PNG y vista de espalda del protagonista (mujer/hombre), con reemplazos visuales si el arte falta y modo de efectos ligeros.
- Taller permite respaldo separado de la galería y del arte enlazado; incluye `getProtagonistPortrait`, objetivos para vista trasera del protagonista y `getCharacterCardArt` para usar el PNG frontal de carta en la colección con reserva a retrato.
- La pantalla inicial muestra un resumen del prólogo confirmado; todavía faltan diálogos y decisiones interactivos del capítulo.
- Elección del protagonista persistida en SQLite.
- Simulador estadístico reproducible recién añadido en `src/game/combat-sim.ts`, pruebas en `src/game/combat-sim.test.ts` y comando interno `npm run simulate:combat`.
- Taller de cartas: galería migrada a IndexedDB, con migración desde localStorage, exportación/restauración de la galería, exportación/restauración independiente de arte enlazado, y destino para arte frontal de cartas (métodos en `web/src/art.ts`, botones en `web/src/card-studio.ts`). CI pasó en el commit `228c39f` (run [40865965609](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40865965609)); el render de arte frontal está añadido en `2381215`/`9b2a6c6` y requiere CI actual. Pendiente prueba manual en navegador. Cada copia se limita a 24 MB; conservar también los PNG originales fuera del navegador.
- Capítulo 1: se añadió marcador persistente `chapter-1-return`, endpoint `POST /api/chapter/return`, botón que aparece tras derrotar al jefe y regresar a Aldea Bruma, y prueba para exigir jefe/villa e impedir cierres duplicados; CI pasó en el commit `228c39f` (run [40865965609](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40865965609)); pendiente recorrido manual.
- Nombre del catálogo corregido a **Pivy**; se conserva el ID técnico `tiny` para no romper colecciones ni assets ya guardados. Pivy sigue fuera del grupo de primera invocación (como se debe) pero su función como compañera de apoyo aún no es jugable; completar después el sistema de apoyos sin convertirla en la carta aleatoria inicial.

## Evidencias

- CI anterior a las últimas incorporaciones: [run 40063931214](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40063931214) pasó compilación y pruebas en el commit `efcf8d2`.
- La ejecución del commit `a6001f9` con el nuevo simulador y pruebas terminó con éxito: [run 40863991681](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40863991681).
- La última comprobación general del commit `228c39f` pasó build y pruebas: [run 40865965609](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40865965609). Los runs anteriores del simulador (`40864000854`) y el soporte de retrato/fallback (`40865883384`) también pasaron.

## Pendiente o no verificable desde GitHub

1. Confirmar CI actual del nuevo arte frontal de carta en `work/png-2d-lightweight-mvp`. Luego hacer pruebas manuales en navegador: vincular PNG frontal y retrato, comprobar el fallback, exportar/restaurar la galería y exportar/restaurar el arte enlazado. CI no sustituye estas comprobaciones.
2. Hacer un recorrido end-to-end del capítulo 1, incluyendo regresar por rutas conectadas a Aldea Bruma y registrar el cierre. Después implementar diálogos/decisiones sin canonizar la trama pendiente de Medusa.
3. Completar catálogo de cartas, duplicados, mejoras, botín, apoyos, Corazones Heroicos y Ruptura de Límite.
4. Completar la función de Pivy como compañera de apoyo, luego ampliar patrones enemigos, medir la curva de dificultad y comparar protagonista S con SR.
5. Añadir las ilustraciones PNG finales suministradas por el usuario, incluido el retrato de espalda del protagonista, y revisar tamaño, transparencia, encuadre y fallbacks.
6. Medir fluidez en el PC del usuario y dentro de Telegram; ningún agente de GitHub puede confirmar el rendimiento en el dispositivo sin una prueba real.
7. Configurar `BOT_TOKEN` y una URL HTTPS real, desplegar el cliente/API y probar inicio, autenticación, guardado y reinicio en Telegram. No inventar credenciales ni afirmar que está desplegado.
8. Añadir backups de la base de datos, rate limiting, moderación y los flujos sociales solo después de estabilizar el MVP.

## Siguiente acción permitida

El siguiente paso es probar manualmente el Taller y el capítulo 1 en navegador; no marcar como terminado el rendimiento de PC o Telegram sin pruebas reales. Después implementar la función de Pivy como apoyo y completar diálogos/decisiones del capítulo usando decisiones aprobadas. Mantener el arco de Medusa como propuesta no aprobada.

## Regla de cierre

No integrar el PR ni declarar el programa completo por la existencia de código. Primero revisar la evidencia, mantener el PR visible y en revisión, y no afirmar que Telegram, la carga de arte, el rendimiento del PC o el balance están verificados sin pruebas de esos entornos.
