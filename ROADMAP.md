# Hoja de ruta

## Prioridad actual: MVP 2D ligero con arte PNG

La dirección visual es 2D, usando ilustraciones PNG, fondos por bioma y efectos breves de CSS. No introducir motor 3D ni 2.5D realista. Las tareas visuales no deben cambiar las reglas de combate salvo que una corrección técnica lo exija.

- [ ] Verificar en CI la reparación del error de compilación conocido en `web/src/main.ts` (`Battle.player.attack` no estaba declarado).
- [x] Añadir el registro local `web/public/assets/umbra/manifest.json` y fallback si no hay ilustración.
- [x] Preparar retratos y fondos PNG opcionales en la interfaz, sin solicitudes si el manifiesto indica `null`.
- [x] Añadir el modo «Efectos ligeros» y respetar la preferencia de movimiento reducido del sistema.
- [x] Añadir persistencia de la elección de protagonista en SQLite y endpoint de perfil; falta confirmación de pruebas CI.
- [ ] Añadir las ilustraciones finales del usuario a sus entradas del manifiesto y revisar el encuadre.
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
- [x] Primera pasada de balance: habilidad requiere Ánima, reduce su daño/curación y deja de ser gratuita; defensa mitiga mejor el golpe cargado anunciado.\n- [x] Añadir intención enemiga autoritativa en servidor (ataque rápido/golpe cargado) y mostrarla en la interfaz antes de la respuesta del jugador.\n- [ ] Ampliar patrones por arquetipo, interrupciones, guardias y encuentros con varios enemigos.
- [ ] Alma y Ánima separados y sin condiciones de carrera en acciones simultáneas.
- [x] Formas Lily → Hero → Epic, ramas Light/Dark, elección explícita y persistencia entre combates; una evolución por batalla.
- [ ] Capítulo 1, enemigos comunes y jefe.
- [x] Región inicial con rutas conectadas y progreso de viaje guardado en SQLite.
- [x] Encuentros ligados a lugares peligrosos y arquetipos de enemigos definidos en servidor.
- [ ] Vincular eventos del mapa con misiones completas, recompensas de exploración y regreso a la ciudad.
- [x] Recompensas básicas de victoria: XP, monedas y materiales guardados sin duplicación.

## Balance y dificultad justa
- [x] Investigar fuentes de diseño y documentar criterios para dificultad entretenida sin castigo molesto ([análisis y plan](./docs/ANALISIS_DIFICULTAD_JUSTA.md)).
- [ ] Preparar simulaciones reproducibles para comparar ataques, habilidades, defensa, evasión, carga y evolución. (siguiente tarea: añadir simulador estadístico automatizado).
- [ ] Probar la curva de dificultad del Bosque Oscuro con derrotas recuperables, indicaciones útiles y sin inflar HP como único ajuste.
- [ ] Comparar protagonista S (sin duplicados y con hitos de resonancia) contra una carta SR con inversión y encuentros controlados.

## Progresión
- [x] Equipamiento inicial: arma, equipo defensivo, accesorio y apoyo objeto, persistidos y con bonificaciones aplicadas al combate.
- [ ] Inventario de botín, desbloqueo de equipo y ranuras avanzadas.
- [ ] Heroínas de apoyo y Corazones Heroicos.
- [ ] Nivel 100, Ruptura de Límite y materiales.
- [ ] Dark, redención, cacerías, eventos y duplicados.
- [ ] Vestiduras fusionadas con epopeyas, cosméticos y variantes jugables diferenciadas.

## Social y despliegue
- [ ] Drops con permisos comprobados en servidor.
- [ ] Bot Telegram, URL HTTPS y despliegue real.
- [ ] Moderación, logs sin secretos, backups y límites de frecuencia.
- [ ] Cooperación y PvP después de estabilizar PvE.

El análisis de dificultad está documentado; las hipótesis numéricas y el balance todavía requieren simulación y playtests. Las maquetas no cuentan como integraciones completas; marcar tareas solo tras comprobar el flujo real. Estado verificado al comenzar esta tanda: el último commit de `main` (`34d780c`) fallaba en `npm run build` por TS2339 en `web/src/main.ts` y, por ello, las pruebas automáticas se omitían. Esta tanda corrige el tipo y añade pruebas para el nuevo perfil; las tareas solo se marcarán verificadas después de que CI termine correctamente. La integración real con Telegram, el despliegue HTTPS, el token del bot, la persistencia en entorno alojado y el recorrido completo de usuario siguen sin validación en producción.
