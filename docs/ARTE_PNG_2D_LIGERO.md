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

La interfaz lee `web/public/assets/umbra/manifest.json` y también permite vincular arte desde el Taller de cartas. La vinculación local se guarda en IndexedDB del navegador para probar el retrato o fondo al instante, pero no se sincroniza con otros dispositivos ni con el WebView de Telegram. Para publicar el arte en todos los dispositivos, agrega al repositorio una copia optimizada y declara su ruta en el manifiesto. Las rutas aceptadas deben ser locales a `/assets/umbra/`; no se cargan URLs de terceros. Mientras una entrada esté a `null` y no exista arte local, se mantiene la ilustración de reserva. Añadir una imagen no marca una tarea como terminada por sí sola: se debe revisar su encuadre, carga, legibilidad, tamaño y comportamiento de reemplazo.

## Criterios de aceptación

- La aplicación compila aunque no haya imágenes finales.
- Una entrada `null` no genera solicitudes HTTP a archivos inexistentes.
- Un retrato válido sustituye la silueta en el espacio correspondiente; si el archivo falla, vuelve al reemplazo.
- El fondo de bioma puede cambiar sin alterar las reglas del juego.
- «Efectos ligeros» persiste en el mismo navegador y desactiva/reduce las animaciones decorativas.
- Las preferencias del sistema operativo que solicitan movimiento reducido se respetan como ajuste inicial.
- La aplicación sigue siendo usable si el manifiesto no se encuentra o no se puede leer.
- El Taller de cartas permite vincular una imagen optimizada a un destino del juego sin editar TypeScript.
- El rendimiento se medirá por separado en el PC del usuario y en Telegram antes de declarar la fase de rendimiento completada.

## Qué no está incluido todavía

No se incluyen ilustraciones originales en este cambio porque el usuario quiere crear el arte. Tampoco se declara completada la integración de toda la colección, las animaciones por piezas, el despliegue de Telegram o la campaña inicial. Esas tareas requieren recursos y pruebas propias.


## Arte del protagonista en vista de espalda

El Taller de cartas puede vincular dos objetivos nuevos: `protagonist:mujer:portrait` y `protagonist:hombre:portrait`. El retrato reemplaza la silueta CSS de la pantalla inicial cuando está disponible. Para respetar la regla de cámara, la ilustración debe mostrar la espalda o una silueta, sin rostro visible. El taller no crea esa imagen ni necesita generarla: el usuario la aporta como PNG/WEBP/JPG.

Si no hay imagen, la ruta falla o el navegador no permite el almacenamiento local, la silueta CSS permanece como reserva. El retrato enlazado se guarda en IndexedDB de ese navegador y puede incluirse en la copia JSON de arte enlazado. No se publica automáticamente; para otros dispositivos debe incorporarse como asset público optimizado en el manifiesto.


## Arte frontal de carta en la colección

El selector **Arte frontal de cartas** ofrece los objetivos `character:<id>:card` para Pivy y las primeras portadoras de referencia. Cuando vincules una imagen a uno de esos destinos, la colección prioriza ese PNG en el frente de la carta. Si ese archivo no carga y existe un retrato de la misma portadora, la interfaz intenta usar el retrato antes de mostrar el espacio de reserva.

Esto mantiene un solo sistema de dibujo y evita duplicar imágenes innecesarias. El arte vinculado se conserva localmente; para compartirlo con otras instalaciones debe añadirse de forma deliberada a `web/public/assets/umbra/` y declararse en `manifest.json`, revisando su tamaño.


## Movimiento ligero sin rigging

Los PNG del protagonista, Pivy y la portadora activa pueden usar un movimiento vertical de dos píxeles con un ciclo lento. No genera sprites adicionales ni anima toda la colección a la vez; aplica una transformación simple al arte visible. El botón **Efectos ligeros** desactiva este movimiento y también se respeta `prefers-reduced-motion`. Los efectos de ataque y evolución siguen siendo independientes, cortos y ligados a acciones confirmadas por el servidor. Este efecto no convierte un PNG plano en un personaje articulado: para separar brazos, pelo o ropa se necesitan capas o fotogramas dibujados.
