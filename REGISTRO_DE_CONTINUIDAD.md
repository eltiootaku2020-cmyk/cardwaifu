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
- Sistema de manifiesto para retratos/fondos PNG, reemplazos visuales si el arte falta y modo de efectos ligeros.
- Elección del protagonista persistida en SQLite.
- Simulador estadístico reproducible recién añadido en `src/game/combat-sim.ts`, pruebas en `src/game/combat-sim.test.ts` y comando interno `npm run simulate:combat`.
- Taller de cartas: galería migrada a IndexedDB con compatibilidad de migración desde localStorage y exportar/restaurar copia JSON; pendiente CI actual y prueba manual. La copia incluye galería/prompts, no arte enlazado.
- Capítulo 1: se añadió marcador persistente `chapter-1-return`, endpoint `POST /api/chapter/return`, botón que aparece tras derrotar al jefe y regresar a Aldea Bruma, y prueba para exigir jefe/villa e impedir cierres duplicados; pendiente CI actual y recorrido manual.
- Inconsistencia a resolver antes de dar por completa la historia de compañera: el lore confirmado la llama **Pivy**, goblin portadora de Arturo S; el catálogo implementado usa el identificador/display `tiny` / **Tiny, la exploradora** y ese ID no forma parte de la primera invocación. No renombrar IDs persistidos ni cambiar la mecánica de compañeras sin definir una migración y revisar el flujo.

## Evidencias

- CI anterior a las últimas incorporaciones: [run 40063931214](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40063931214) pasó compilación y pruebas en el commit `efcf8d2`.
- La ejecución del commit `a6001f9` con el nuevo simulador y pruebas terminó con éxito: [run 40863991681](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40863991681).
- La ejecución del commit final de los archivos del simulador y comando (`d78c52c`) debe ser la referencia final para validar build y suite: [run 40864000854](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40864000854). En la última revisión todavía estaba en curso.

## Pendiente o no verificable desde GitHub

1. Confirmar el resultado final de CI del último commit; corregir cualquier fallo antes de marcar el Taller de cartas o el cierre del capítulo como verificados.
2. Hacer un recorrido end-to-end del capítulo 1, incluyendo regresar por rutas conectadas a Aldea Bruma y registrar el cierre. Después implementar diálogos/decisiones sin canonizar la trama pendiente de Medusa.
3. Completar catálogo de cartas, duplicados, mejoras, botín, apoyos, Corazones Heroicos y Ruptura de Límite.
4. Ampliar patrones enemigos y medir la curva de dificultad; comparar protagonista S con SR.
5. Añadir las ilustraciones PNG finales suministradas por el usuario y revisar tamaño, transparencia, encuadre y fallbacks.
6. Medir fluidez en el PC del usuario y dentro de Telegram; ningún agente de GitHub puede confirmar el rendimiento en el dispositivo sin una prueba real.
7. Configurar `BOT_TOKEN` y una URL HTTPS real, desplegar el cliente/API y probar inicio, autenticación, guardado y reinicio en Telegram. No inventar credenciales ni afirmar que está desplegado.
8. Añadir backups de la base de datos, rate limiting, moderación y los flujos sociales solo después de estabilizar el MVP.

## Siguiente acción permitida

Consultar la ejecución CI del último commit de `work/png-2d-lightweight-mvp`. Si pasa, registrar el cierre del capítulo como validado por CI, no como probado en navegador. Si falla, usar los logs para corregirlo en la misma rama. Después ejecutar un recorrido manual y abordar los diálogos/decisiones del capítulo; mantener la historia de Medusa como propuesta no aprobada.

## Regla de cierre

No integrar el PR ni declarar el programa completo por la existencia de código. Primero revisar la evidencia, mantener el PR visible y en revisión, y no afirmar que Telegram, la carga de arte, el rendimiento del PC o el balance están verificados sin pruebas de esos entornos.
