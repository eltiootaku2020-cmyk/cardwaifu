# UMBRA: Card Frontier — Registro de continuidad

Actualizado: 2026-10-29

## Fuente de verdad y protocolo

- Repositorio: https://github.com/eltiootaku2020-cmyk/cardwaifu
- Documento de reglas y lore: [CEREBRO_Y_OBRERO.md](./CEREBRO_Y_OBRERO.md)
- Hoja de ruta: [ROADMAP.md](./ROADMAP.md)
- Diseño 2D ligero: [docs/ARTE_PNG_2D_LIGERO.md](./docs/ARTE_PNG_2D_LIGERO.md)
- Análisis de combate: [docs/ANALISIS_DIFICULTAD_JUSTA.md](./docs/ANALISIS_DIFICULTAD_JUSTA.md)
- Rama de trabajo: `work/png-2d-lightweight-mvp`
- Lanzador local Windows: [`INICIAR_UMBRA.bat`](./INICIAR_UMBRA.bat); CI solo comprueba código TypeScript, por lo que falta probar el doble clic en Windows.
- Copia de datos: [`RESPALDAR_UMBRA.bat`](./RESPALDAR_UMBRA.bat) llama a `npm run backup:db`; `src/backup-db.ts` usa la copia en línea SQLite y conserva diez copias generadas. La prueba `src/backup-db.test.ts` pasó CI en [40867781026](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40867781026). La verificación manual de creación/restauración en Windows sigue pendiente. `.gitignore` excluye `/data/`, `/backups/`, `*.sqlite` y `*.db` para prevenir que progreso privado se suba al repositorio.
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
- Movimiento respiratorio de 2 px para PNG del protagonista, Pivy y portadora activa; el control de efectos ligeros y `prefers-reduced-motion` lo desactivan. No se animan todas las cartas a la vez.
- Taller permite respaldo separado de la galería y del arte enlazado; incluye `getProtagonistPortrait`, objetivos para vista trasera del protagonista y `getCharacterCardArt` para usar el PNG frontal de carta en la colección con reserva a retrato.
- La pantalla inicial muestra un resumen del prólogo confirmado y una tarjeta ligera que identifica a Pivy como compañera desde el inicio, separada de la primera invocación aleatoria. No se le inventaron bonus de combate; todavía faltan los apoyos jugables y diálogos/decisiones interactivos del capítulo.
- Elección del protagonista persistida en SQLite.
- Simulador estadístico reproducible recién añadido en `src/game/combat-sim.ts`, pruebas en `src/game/combat-sim.test.ts` y comando interno `npm run simulate:combat`.
- Taller de cartas: galería migrada a IndexedDB con migración desde localStorage, copia/restauración independiente de arte enlazado, y objetivos de arte frontal para la colección. El arte frontal y su reserva al retrato, así como la navegación simple y el panel de equipo visible, pasaron CI en `435cd87` (run [40866459053](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40866459053)). Pendiente prueba manual en navegador. Cada copia se limita a 24 MB; conservar también los PNG originales fuera del navegador.
- Capítulo 1: se añadió marcador persistente `chapter-1-return`, endpoint `POST /api/chapter/return`, botón que aparece tras derrotar al jefe y regresar a Aldea Bruma, y prueba para exigir jefe/villa e impedir cierres duplicados; CI pasó en el commit `228c39f` (run [40865965609](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40865965609)); pendiente recorrido manual.
- Nombre del catálogo corregido a **Pivy**; se conserva el ID técnico `tiny` para no romper colecciones ni assets ya guardados. Pivy sigue fuera del grupo de primera invocación (como se debe) pero su función como compañera de apoyo aún no es jugable; completar después el sistema de apoyos sin convertirla en la carta aleatoria inicial.

## Incidente y recuperación de alcance

El 2026-10-29, la acción `create_file` del conector escribió `INICIAR_UMBRA.bat` en `main` pese a haberse solicitado `work/png-2d-lightweight-mvp`. Se detectó antes de cerrar la tarea, se retiró con revert `c9b27e555972182f96fc594309742f3987b85e3f`, y la ausencia se verificó en el árbol actual de `main`. Después se añadió el mismo archivo a la rama de trabajo con Git Data y avance de referencia condicionado al SHA esperado: commit `13723c30cf512b1d67476ca3f57b2e2dd7ce1da9`. No se debe confundir el incidente de historial con un cambio funcional persistente en `main`; la rama autorizada contiene la versión que debe revisarse.

## Evidencias

- CI anterior a las últimas incorporaciones: [run 40063931214](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40063931214) pasó compilación y pruebas en el commit `efcf8d2`.
- La ejecución del commit `a6001f9` con el nuevo simulador y pruebas terminó con éxito: [run 40863991681](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40863991681).
- La última comprobación general del commit `435cd87` pasó build y pruebas: [run 40866459053](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40866459053). También pasaron la integración de PNG, las copias de arte y el cierre automatizado del capítulo.

## Pendiente o no verificable desde GitHub

0. Probar `INICIAR_UMBRA.bat` en Windows real; confirmar que verifica Node 20+, prepara `.env` sin secretos, instala dependencias solo si faltan, abre localhost y puede detenerse cerrando la ventana de servidor.
1. Probar `RESPALDAR_UMBRA.bat` sobre una base real: crear copia, comprobar que se abre y conserva filas, verificar rotación de diez copias y confirmar que el archivo original no cambia.

1. Hacer pruebas manuales en navegador: vincular PNG frontal, retrato y protagonista; comprobar los fallbacks; exportar/restaurar la galería y el arte enlazado. CI pasó, pero no sustituye estas comprobaciones.
2. Hacer un recorrido end-to-end del capítulo 1, incluyendo regresar por rutas conectadas a Aldea Bruma y registrar el cierre. Después implementar diálogos/decisiones sin canonizar la trama pendiente de Medusa.
3. Completar catálogo de cartas, duplicados, mejoras, botín, apoyos, Corazones Heroicos y Ruptura de Límite.
4. Completar la función de Pivy como compañera de apoyo, luego ampliar patrones enemigos, medir la curva de dificultad y comparar protagonista S con SR.
5. Añadir las ilustraciones PNG finales suministradas por el usuario, incluido el retrato de espalda del protagonista, y revisar tamaño, transparencia, encuadre y fallbacks.
6. Medir fluidez en el PC del usuario y dentro de Telegram; ningún agente de GitHub puede confirmar el rendimiento en el dispositivo sin una prueba real.
7. Configurar `BOT_TOKEN` y una URL HTTPS real, desplegar el cliente/API y probar inicio, autenticación, guardado y reinicio en Telegram. No inventar credenciales ni afirmar que está desplegado.
8. Completar prueba manual de los backups SQLite, añadir rate limiting/moderación y abordar los flujos sociales solo después de estabilizar el MVP.

## Siguiente acción permitida

CI detectó un error TS2709 en el tipo de la prueba de copia SQLite; se corrigió con `InstanceType<typeof Database>` en el commit `5ad1284`, y la CI de recuperación pasó en run [40867781026](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40867781026). El siguiente paso es probar manualmente los dos lanzadores en Windows, la creación/restauración de copias, el Taller y el capítulo 1; no marcar como terminado el rendimiento de PC o Telegram sin pruebas reales. Después implementar la función de Pivy como apoyo y completar diálogos/decisiones del capítulo usando decisiones aprobadas. Mantener el arco de Medusa como propuesta no aprobada.

## Regla de cierre

No integrar el PR ni declarar el programa completo por la existencia de código. Primero revisar la evidencia, mantener el PR visible y en revisión, y no afirmar que Telegram, la carga de arte, el rendimiento del PC o el balance están verificados sin pruebas de esos entornos.


## Actualización de continuidad — 29-10-2026

### Tanda 2D PNG y facilidad de uso
- Pivy se presenta como compañera de viaje desde el inicio en `web/src/main.ts`; sigue separada de la invocación aleatoria. No se le asignó una bonificación de combate no aprobada.
- La ilustración activa del protagonista, Pivy y la portadora usa una animación CSS vertical de solo 2 px con ciclo lento. `Efectos ligeros` y `prefers-reduced-motion` la desactivan; no se anima todo el catálogo.
- El panel de navegación facilita saltar a Inicio, Cartas, Expedición, Equipo y Combate. El taller muestra PNG frontal de carta con fallback al retrato.
- Se añadieron los accesos directos `INICIAR_UMBRA.bat` y `RESPALDAR_UMBRA.bat`. El segundo hace una copia consistente por SQLite, conserva 10 copias, y el test de la API SQLite pasó CI en [40867781026](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40867781026). `.gitignore` excluye `/data/`, `/backups/`, `*.sqlite` y `*.db`.
- La última evidencia de CI de la implementación visual anterior a la animación PNG y su documentación es [40868412632](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40868412632), y la CI de animación/documentación pasó en [40868522785](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40868522785). La CI del estado consolidado con el README y el lanzador robusto pasó build, typecheck y tests en [40868821188](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40868821188) para el commit `1d4b79a21e3a598a18425066a16fda149ddd9b83`.

### Límites explícitos
- Esta tanda no pone arte final del usuario: el manifiesto tiene sus targets en null hasta que el usuario aporte los PNG.
- No se ha probado `INICIAR_UMBRA.bat` ni `RESPALDAR_UMBRA.bat` en Windows real; tampoco el backup/restore de arte, el rendimiento en el PC o Telegram en producción.
- Mantener la rama `work/png-2d-lightweight-mvp`, PR #1 borrador; nunca fusionar automáticamente a `main`.
- La tarea siguiente es conseguir CI verde en el último commit y revisar que la copia SQLite, los dos accesos directos, el PNG/fallback y el cierre de capítulo están descritos con límites honestos. Después continuar con el MVP dentro de decisiones ya confirmadas; no inventar rates de gacha, números de duplicados, habilidades de Pivy ni canonizar Medusa.


## Obtención e inicio sin comandos — 29-10-2026

- El README incluye un enlace al ZIP de `work/png-2d-lightweight-mvp` para evitar descargar `main` por error.
- El lanzador espera hasta 30 segundos a que `http://localhost:5173` responda antes de abrir el navegador; si no responde, dirige al usuario a la ventana de servidor para ver el error.
- Esto está pendiente de prueba manual en Windows real; CI no ejecuta el `.bat`.


## Estado aceptado por CI — 29-10-2026

- Head de trabajo comprobado antes de esta actualización documental: `2064bcd08a21c5c85a7106ea0cfd3e3a2cfdf78a`.
- Build, typecheck y suite automatizada pasan en [run 40868966055](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40868966055).
- El README enlaza al ZIP de la rama de trabajo; el lanzador verifica Node 20+, prepara dependencias solo cuando faltan y espera hasta 30 segundos al servidor local antes de abrir el navegador. Debe probarse manualmente en Windows real.
- Pivy se muestra como compañera desde el inicio. La animación PNG de baja intensidad se desactiva con la preferencia de efectos ligeros o movimiento reducido.
- Aún no hay PNG finales en el manifiesto; su integración se acepta después de que el usuario aporte ilustraciones y se revisen los fallbacks.
- Windows real, navegador con arte real, rendimiento del PC y Telegram desplegado continúan como bloqueos de aceptación manual. No declarar UMBRA completo ni fusionar el PR solo por CI verde.
