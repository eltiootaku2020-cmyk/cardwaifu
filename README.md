# UMBRA: Card Frontier

RPG anime de cartas coleccionables en desarrollo, pensado primero como Telegram Mini App.

## Fuente de verdad
Lee [CEREBRO_Y_OBRERO.md](./CEREBRO_Y_OBRERO.md) antes de modificar lore o reglas. Arquitectura: [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md). Plan: [ROADMAP.md](./ROADMAP.md). Dirección visual PNG ligera: [docs/ARTE_PNG_2D_LIGERO.md](./docs/ARTE_PNG_2D_LIGERO.md). Referencias: [docs/REFERENCIAS.md](./docs/REFERENCIAS.md).

## Estado
MVP jugable en construcción. Ya incluye combate por turnos en servidor, primera invocación persistente, mapa del Bosque Oscuro, equipo inicial, recompensas básicas y taller de cartas. La dirección visual es 2D ligera: el juego admite retratos y fondos PNG mediante `web/public/assets/umbra/manifest.json`, usa reemplazos cuando aún no hay arte y ofrece un modo «Efectos ligeros». La integración/despliegue real de Telegram todavía no está completada ni validada.

## Iniciar en Windows sin escribir comandos
1. Instala Node.js 20 o superior si aún no está instalado: [nodejs.org](https://nodejs.org/).
2. En la carpeta del proyecto, haz doble clic en **`INICIAR_UMBRA.bat`**.
3. La primera vez, el lanzador crea la configuración local sin credenciales y prepara las dependencias. Después abre el navegador en `http://localhost:5173`.
4. Para cerrar el juego, cierra la ventana de consola **UMBRA - Servidor**. No queda ejecutándose intencionalmente oculto.

El lanzador no instala Node.js por su cuenta, no crea ni publica un token de Telegram y no sube tus imágenes al repositorio. Si Node.js o la conexión de internet faltan, muestra instrucciones y se detiene.

## Inicio manual / desarrollo
Requisito: Node.js 20+ y npm. Copia `.env.example` a `.env` si el lanzador no lo ha hecho, ejecuta `npm install` y `npm run dev`. Para el bot, `npm run bot` requiere `BOT_TOKEN` configurado y una URL HTTPS real para la Mini App.

Nunca publiques tokens. Para que `/start` muestre el botón de la Mini App, configura `MINI_APP_URL` con una URL pública HTTPS real; el bot no debe abrir un dominio de ejemplo. En producción valida Telegram WebApp initData en servidor, añade rate limits, backups, persistencia de batallas y pruebas.