# Hoja de ruta

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
- [ ] Reequilibrar las acciones para que ninguna sea dominante gratis; añadir intención visible y patrones contrarrestables por arquetipo.
- [ ] Alma y Ánima separados y sin condiciones de carrera en acciones simultáneas.
- [x] Formas Lily → Hero → Epic, ramas Light/Dark, elección explícita y persistencia entre combates; una evolución por batalla.
- [ ] Capítulo 1, enemigos comunes y jefe.
- [x] Región inicial con rutas conectadas y progreso de viaje guardado en SQLite.
- [x] Encuentros ligados a lugares peligrosos y arquetipos de enemigos definidos en servidor.
- [ ] Vincular eventos del mapa con misiones completas, recompensas de exploración y regreso a la ciudad.
- [x] Recompensas básicas de victoria: XP, monedas y materiales guardados sin duplicación.

## Balance y dificultad justa
- [x] Investigar fuentes de diseño y documentar criterios para dificultad entretenida sin castigo molesto ([análisis y plan](./docs/ANALISIS_DIFICULTAD_JUSTA.md)).
- [ ] Preparar simulaciones reproducibles para comparar ataques, habilidades, defensa, evasión, carga y evolución.
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

El análisis de dificultad está documentado; las hipótesis numéricas y el balance todavía requieren simulación y playtests. Las maquetas no cuentan como integraciones completas; marcar tareas solo tras comprobar el flujo real. Build, typecheck y pruebas automatizadas pasan en GitHub Actions en el último commit de la tanda. La integración real con Telegram, despliegue HTTPS, token de bot, persistencia en entorno alojado y recorrido completo de usuario aún no se han validado en producción. Las pruebas automatizadas se ejecutan durante el desarrollo; el usuario no necesita hacer pasos técnicos manuales.
