# UMBRA: Card Frontier

RPG anime de cartas coleccionables en desarrollo, pensado primero como Telegram Mini App.

## Fuente de verdad
Lee [CEREBRO_Y_OBRERO.md](./CEREBRO_Y_OBRERO.md) antes de modificar lore o reglas. Arquitectura: [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md). Plan: [ROADMAP.md](./ROADMAP.md). Referencias: [docs/REFERENCIAS.md](./docs/REFERENCIAS.md).

## Estado
MVP jugable en construcción. Ya incluye combate por turnos en servidor, primera invocación persistente, mapa de rutas del Bosque Oscuro, equipo de cuatro espacios, recompensas básicas, taller de cartas y una capa visual de invocación, ataques, daños confirmados, poderes, cámara y biomas. La integración/despliegue real de Telegram todavía no está completada ni validada.

## Requisitos
Node.js 20+ y npm. Copia `.env.example` a `.env`, ejecuta `npm install` y `npm run dev`. Para bot: `npm run bot` con `BOT_TOKEN` configurado.

Nunca publiques tokens. En producción valida Telegram WebApp initData en servidor, añade rate limits, persistencia de batallas y pruebas.