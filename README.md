# UMBRA: Card Frontier

RPG anime de cartas coleccionables en desarrollo, pensado primero como Telegram Mini App.

## Fuente de verdad
Lee [CEREBRO_Y_OBRERO.md](./CEREBRO_Y_OBRERO.md) antes de modificar lore o reglas. Arquitectura: [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md). Plan: [ROADMAP.md](./ROADMAP.md).

## Estado
MVP en construcción. Este repo contiene diseño y un esqueleto inicial; aún no significa que esté publicado ni integrado con Telegram.

## Requisitos
Node.js 20+ y npm. Copia `.env.example` a `.env`, ejecuta `npm install` y `npm run dev`. Para bot: `npm run bot` con `BOT_TOKEN` configurado.

Nunca publiques tokens. En producción valida Telegram WebApp initData en servidor, añade rate limits, persistencia de batallas y pruebas.