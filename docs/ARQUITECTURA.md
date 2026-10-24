# Arquitectura inicial

- `web/`: cliente Mini App TypeScript + Vite.
- `src/server.ts`: API Express.
- `src/game/`: tipos, catálogo y reglas independientes de la UI.
- `src/db.ts`: SQLite para prototipo.
- `src/telegram/auth.ts`: validación de initData.
- `src/bot.ts`: bot básico con grammY.

## Seguridad
El cliente no es autoridad para recursos, combate, inventario o permisos. Validar initData en servidor con HMAC según la documentación oficial de Telegram y rechazar datos antiguos. No registrar tokens ni initData completos. Añadir rate limiting, backups, migraciones y pruebas antes de abrir el servicio. SQLite vale para el primer prototipo; evaluar PostgreSQL al escalar.

## Flujo
Telegram abre Mini App → cliente envía initData → backend valida firma/fecha → carga o crea perfil → acciones de combate se resuelven en servidor.

## Presentación 2D y arte

La interfaz usa TypeScript, CSS y assets locales: no necesita motor 3D. El registro de imágenes está en `web/public/assets/umbra/manifest.json` y las reglas de trabajo en [docs/ARTE_PNG_2D_LIGERO.md](./ARTE_PNG_2D_LIGERO.md). Los retratos/fondos se cargan solo si se declaran en el manifiesto; una entrada vacía conserva la presentación de reserva. El modo de efectos reducido prioriza la fluidez y no altera las reglas de juego.

## Configuración del bot

`MINI_APP_URL` debe ser una URL pública HTTPS que realmente sirva la Mini App. Si no está configurada o conserva un dominio de ejemplo, el bot debe responder sin mostrar un botón roto. No se considera integración completa hasta probar el bot con un token real y la aplicación ya desplegada.
