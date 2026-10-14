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