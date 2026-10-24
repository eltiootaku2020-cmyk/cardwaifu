# UMBRA — Dirección visual 2D ligera basada en PNG

**Estado:** dirección técnica aprobada para el MVP. No implica que las ilustraciones finales estén incluidas ni que el rendimiento ya haya sido medido en el PC del usuario.

## Objetivo

Crear una aventura de cartas que se sienta viva usando ilustraciones 2D propias, fondos por bioma y animaciones breves. No introducir un motor 3D ni una escena 2.5D realista. Mantener el stack existente: TypeScript, Vite, HTML/CSS, Canvas 2D para el taller y API/SQLite para el estado del juego.

## Capas visuales

1. **Carta:** PNG original compuesto con un marco propio, rareza, atributos y datos legibles.
2. **Retrato de combate:** PNG transparente de la portadora o enemiga; la silueta CSS permanece como reemplazo cuando no hay arte asignado.
3. **Escenario:** fondo fijo por bioma y capas decorativas sencillas. El fondo no participa en la lógica de combate.
4. **Acción:** desplazamiento corto, sacudida limitada, número de daño y destello. El estado real siempre procede del servidor.
5. **Evolución/invocación:** efecto corto con opción de reducir o desactivar animaciones.

## Presupuesto visual inicial

- Retratos recomendados: PNG RGBA, aproximadamente 512–1024 px en el lado largo según el arte, evitando resolución innecesaria.
- Fondos: preferir WebP o JPEG optimizado cuando no haya transparencia; si se usa PNG, limitar la resolución al tamaño de presentación razonable.
- Solo cargar las imágenes de la pantalla actual y usar `loading="lazy"` para arte de catálogo fuera de vista.
- Evitar reproducción de vídeo, canvas 3D, filtros intensivos permanentes y grandes sistemas de partículas.
- El modo «Efectos ligeros» reduce animaciones y movimiento decorativo, sin desactivar acciones o información del combate.
- Mantener las ilustraciones originales en un archivo de respaldo. Los assets del juego son copias optimizadas.

## Registro de arte

La interfaz lee `web/public/assets/umbra/manifest.json`. Las rutas aceptadas deben ser locales a `/assets/umbra/`; no se cargan URLs de terceros. Mientras una entrada esté a `null`, se mantiene la ilustración de reserva. Añadir una imagen no marca una tarea como terminada por sí sola: se debe revisar su encuadre, carga, legibilidad, tamaño y comportamiento de reemplazo.

## Criterios de aceptación

- La aplicación compila aunque no haya imágenes finales.
- Una entrada `null` no genera solicitudes HTTP a archivos inexistentes.
- Un retrato válido sustituye la silueta en el espacio correspondiente; si el archivo falla, vuelve al reemplazo.
- El fondo de bioma puede cambiar sin alterar las reglas del juego.
- «Efectos ligeros» persiste en el mismo navegador y desactiva/reduce las animaciones decorativas.
- Las preferencias del sistema operativo que solicitan movimiento reducido se respetan como ajuste inicial.
- La aplicación sigue siendo usable si el manifiesto no se encuentra o no se puede leer.
- El rendimiento se medirá por separado en el PC del usuario y en Telegram antes de declarar la fase de rendimiento completada.

## Qué no está incluido todavía

No se incluyen ilustraciones originales en este cambio porque el usuario quiere crear el arte. Tampoco se declara completada la integración de toda la colección, las animaciones por piezas, el despliegue de Telegram o la campaña inicial. Esas tareas requieren recursos y pruebas propias.
