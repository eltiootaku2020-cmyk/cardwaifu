# Hoja de ruta

## Prioridad actual: MVP 2D ligero con arte PNG

La dirección visual es 2D, usando ilustraciones PNG, fondos por bioma y efectos breves de CSS. No introducir motor 3D ni 2.5D realista. Las tareas visuales no deben cambiar las reglas de combate salvo que una corrección técnica lo exija.

- [x] Corregir el error de compilación `Battle.player.attack` no declarado; TypeScript/build y pruebas pasaron en CI en el commit `fe79d16` (run [40063580422](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40063580422)).
- [x] Añadir el registro local `web/public/assets/umbra/manifest.json` y fallback si no hay ilustración.
- [x] Conectar retratos y fondos PNG opcionales desde el manifiesto; las entradas `null` no solicitan archivos inexistentes.
- [x] Añadir el modo «Efectos ligeros», respetar la preferencia de movimiento reducido del sistema y guardar el ajuste en el navegador.
- [x] Guardar la elección de protagonista en SQLite mediante endpoint de perfil; el test de persistencia pasa en CI.
- [x] Añadir lanzador `INICIAR_UMBRA.bat` y guía de inicio con doble clic para Windows (archivo integrado en la rama `work/png-2d-lightweight-mvp`, commit `13723c3`).
- [ ] Probar el lanzador en Windows real; la CI TypeScript no ejecuta archivos `.bat` ni comprueba el arranque local.
- [ ] Probar la herramienta de copia de SQLite en Windows con una base real, incluyendo existencia del archivo, datos recuperables y retención de diez copias; el script, acceso directo y prueba automatizada de la API ya están añadidos y la CI del commit actual está en curso.
- [x] Añadir al Taller de cartas vinculación de PNG a una portadora, enemiga o fondo, con optimización y guardado local en IndexedDB (no sincroniza ni publica automáticamente).
- [ ] Probar manualmente la galería del Taller en IndexedDB, migración desde `localStorage`, exportación/restauración de tarjetas+prompts y exportación/restauración independiente de PNG enlazados (CI pasó en el commit `228c39f`; ambas copias están limitadas a 24 MB).
- [ ] Probar con PNG real los retratos de espalda del protagonista (mujer/hombre), el reemplazo de la silueta CSS y el fallback cuando la imagen falta; CI pasó en el commit `228c39f`, la prueba manual sigue pendiente.
- [ ] Probar arte frontal de carta (`character:<id>:card`) en la colección, fallback al retrato si el PNG de carta falla y copia/restauración del arte vinculado; control y render ya pasan CI en el run [40866459053](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40866459053), queda pendiente prueba de navegador.
- [ ] Añadir las ilustraciones finales del usuario a las entradas públicas del manifiesto y revisar el encuadre.
- [ ] Medir fluidez en el PC del usuario y dentro de Telegram; no declarar la optimización completa antes de medir.
- [ ] Completar el MVP jugable y verificar el recorrido de principio a fin según los criterios inferiores.


## Base
- [x] Consolidar lore y sistemas en CEREBRO_Y_OBRERO.md.
- [x] Definir Mini App + API + bot + SQLite.
- [x] Instalar dependencias y verificar build (GitHub Actions, run #11).
- [x] Añadir pruebas automáticas iniciales para combate (GitHub Actions, run #11).
- [x] Añadir especificación ampliada de sistemas, bucle jugable y referencias técnicas en docs/DISENO_JUGABLE_Y_SISTEMAS.md.

## MVP jugable
- [ ] Selección de protagonista y cámara desde atrás, rostro oculto.
- [x] Primera invocación aleatoria única por cuenta y vínculo persistente en SQLite.
- [ ] Colección completa, vista de todas las cartas, duplicados y mejora de unidades.
- [ ] Protagonista S con duplicados y coste de ascensión progresivo; comparar en pruebas de juego una ruta S frente a una carta SR con condiciones equivalentes.
- [ ] Colección persistente y rarezas R/S/SR/SSR/UR.
- [ ] Combate por turnos resuelto en servidor con enemigos/patrones, estados y recompensas.
- [x] Primera pasada de balance: habilidad requiere Ánima, reduce su daño/curación y deja de ser gratuita; defensa mitiga mejor el golpe cargado anunciado.
- [x] Añadir intención enemiga autoritativa en servidor (ataque rápido/golpe cargado) y mostrarla en la interfaz antes de la respuesta del jugador.
- [ ] Ampliar patrones por arquetipo, interrupciones, guardias y encuentros con varios enemigos.
- [x] Sincronizar Alma y Ánima entre combates y rechazar acciones obsoletas de una batalla si otra acción ya avanzó el turno; quedan pruebas de carga/concurrencia en el flujo de usuario.
- [ ] Completar simulaciones concurrentes y pruebas de múltiples acciones simultáneas en entorno de despliegue.
- [x] Formas Lily → Hero → Epic, ramas Light/Dark, elección explícita y persistencia entre combates; una evolución por batalla.
- [ ] Capítulo 1, enemigos comunes y jefe.
- [x] Región inicial con rutas conectadas y progreso de viaje guardado en SQLite.
- [x] Encuentros ligados a lugares peligrosos y arquetipos de enemigos definidos en servidor.
- [x] Conectar eventos de descanso/descubrimiento/visita con resolución única y recompensas persistentes; guardar objetivos del capítulo y bloquear la entrada al jefe hasta completar los cuatro requisitos.
- [x] Añadir navegación sencilla por secciones y mostrar el panel de equipamiento en la aplicación (CI pasó en [40866459053](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40866459053)); recorrido manual de usuario pendiente.
- [ ] Completar misiones narrativas con diálogos y decisiones significativas (el contenido de historia del capítulo 1 sigue pendiente).
- [ ] Recorrer manualmente el capítulo 1 completo: derrotar al jefe, volver por rutas conectadas a Aldea Bruma y registrar el cierre una sola vez; endpoint, botón y pruebas automatizadas ya añadidos, CI pasó en el commit `228c39f`.
- [x] Recompensas básicas de victoria: XP, monedas y materiales guardados sin duplicación.

## Balance y dificultad justa
- [x] Investigar fuentes de diseño y documentar criterios para dificultad entretenida sin castigo molesto ([análisis y plan](./docs/ANALISIS_DIFICULTAD_JUSTA.md)).
- [x] Verificar en CI el simulador estadístico reproducible en `src/game/combat-sim.ts`, sus pruebas y el comando interno `npm run simulate:combat` (CI pasó en [40865965609](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40865965609)); sus métricas orientan el balance, pero no sustituyen playtests.
- [ ] Probar la curva de dificultad del Bosque Oscuro con derrotas recuperables, indicaciones útiles y sin inflar HP como único ajuste.
- [ ] Comparar protagonista S (sin duplicados y con hitos de resonancia) contra una carta SR con inversión y encuentros controlados.

## Progresión
- [x] Equipamiento inicial: arma, equipo defensivo, accesorio y apoyo objeto, persistidos y con bonificaciones aplicadas al combate.
- [ ] Inventario de botín, desbloqueo de equipo y ranuras avanzadas.
- [ ] Heroínas de apoyo y Corazones Heroicos; Pivy está identificada en el catálogo, pero aún falta integrarla como compañera de apoyo funcional sin convertirla en la invocación aleatoria inicial.
- [ ] Nivel 100, Ruptura de Límite y materiales.
- [ ] Dark, redención, cacerías, eventos y duplicados.
- [ ] Vestiduras fusionadas con epopeyas, cosméticos y variantes jugables diferenciadas.

## Social y despliegue
- [ ] Drops con permisos comprobados en servidor.
- [ ] Bot Telegram, URL HTTPS y despliegue real.
- [x] Añadir copias de respaldo locales de SQLite, acceso directo de Windows, rotación de diez copias, test automatizado de la API y exclusiones en `.gitignore`; la CI pasó en [40867781026](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40867781026).
- [ ] Probar manualmente en Windows la creación, recuperación, retención de diez copias y restauración tras detener la aplicación.
- [ ] Moderación, logs sin secretos y límites de frecuencia.
- [ ] Cooperación y PvP después de estabilizar PvE.

El análisis de dificultad está documentado; las hipótesis numéricas y el balance todavía requieren simulación y playtests. Las maquetas no cuentan como integraciones completas; marcar tareas solo tras comprobar el flujo real. El árbol actual de `main` no contiene el lanzador ni cambios funcionales de esta entrega: el archivo se agregó allí accidentalmente por el conector y se retiró con el revert `c9b27e5`; se confirmó que ahora no existe en `main`. El lanzador correcto está en `work/png-2d-lightweight-mvp`. La CI de la implementación visual pasó en `435cd87` ([run 40866459053](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40866459053)) y la CI del lanzador pasó en `13723c3` ([run 40867110606](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40867110606)). La CI de la prueba de copia SQLite pasó en el commit `5ad1284` ([run 40867781026](https://github.com/eltiootaku2020-cmyk/cardwaifu/actions/runs/40867781026)); el `.gitignore` actualizado está pendiente de CI. Las pruebas no validan manualmente el `.bat` en Windows, las copias de arte en navegador, el rendimiento en el PC del usuario ni Telegram en producción.
