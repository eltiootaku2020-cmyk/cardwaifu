# Hoja de ruta

## Base
- [x] Consolidar lore y sistemas en CEREBRO_Y_OBRERO.md.
- [x] Definir Mini App + API + bot + SQLite.
- [x] Instalar dependencias y verificar build (GitHub Actions, run #11).
- [x] Añadir pruebas automáticas iniciales para combate (GitHub Actions, run #11).
- [x] Añadir especificación ampliada de sistemas, bucle jugable y referencias técnicas en docs/DISENO_JUGABLE_Y_SISTEMAS.md.

## MVP jugable
- [ ] Selección de protagonista y cámara desde atrás, rostro oculto.
- [ ] Primera invocación aleatoria persistente y vínculo narrativo.
- [ ] Colección persistente y rarezas R/S/SR/SSR/UR.
- [ ] Combate por turnos resuelto en servidor con enemigos/patrones, estados y recompensas.
- [ ] Alma y Ánima separados y sin condiciones de carrera en acciones simultáneas.
- [ ] Formas Lily → Hero → Epic, ramas Light/Dark y una evolución por batalla.
- [ ] Capítulo 1, enemigos comunes y jefe.
- [ ] Región de bosque con rutas conectadas y progreso de viaje guardado en SQLite (implementación inicial añadida; falta validar integración completa).
- [ ] Vincular eventos del mapa con encuentros, recompensas y regreso a la ciudad.

## Progresión
- [ ] Equipamiento: arma, dos equipos, apoyo objeto y accesorios.
- [ ] Heroínas de apoyo y Corazones Heroicos.
- [ ] Nivel 100, Ruptura de Límite y materiales.
- [ ] Dark, redención, cacerías, eventos y duplicados.
- [ ] Vestiduras fusionadas con epopeyas, cosméticos y variantes jugables diferenciadas.

## Social y despliegue
- [ ] Drops con permisos comprobados en servidor.
- [ ] Bot Telegram, URL HTTPS y despliegue real.
- [ ] Moderación, logs sin secretos, backups y límites de frecuencia.
- [ ] Cooperación y PvP después de estabilizar PvE.

Las maquetas no cuentan como integraciones completas; marcar tareas solo tras comprobar el flujo real. Las pruebas automatizadas se ejecutan durante el desarrollo para reducir regresiones; no requieren que el usuario haga pasos técnicos manuales.
