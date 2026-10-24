# Arte 2D de UMBRA

Este directorio contiene el registro del arte público que la interfaz puede cargar. No requiere un motor 3D ni subir imágenes del usuario a un servicio externo.

## Forma sencilla: probar una imagen desde el Taller de cartas

1. Abre el Taller de cartas en la aplicación.
2. Carga tu PNG (se recomienda transparencia para retratos).
3. En «Vincular al juego», elige una portadora, una enemiga o un fondo.
4. Pulsa «Vincular PNG al juego». La imagen se reduce a un máximo de 1024 px por lado y se guarda en IndexedDB del navegador. No se envía a un servidor.

Esta vinculación local sirve para diseñar y probar el juego sin editar archivos. No sincroniza imágenes con otros dispositivos, perfiles de navegador o instalaciones de Telegram.

## Incluir ilustraciones en la versión desplegada

1. Conserva siempre el original fuera del juego como copia maestra.
2. Añade una copia optimizada en este directorio. Para retratos, prefiere PNG con transparencia; para fondos, PNG o WebP.
3. Edita `manifest.json` y sustituye el `null` de la entrada correspondiente por la ruta pública, por ejemplo `/assets/umbra/characters/juana.png`.
4. Si una entrada está en `null`, el juego usa su diseño de reserva y no solicita archivos que no existen.

## Rutas sugeridas

- `characters/`: retratos de portadoras; usa las claves del grupo `characters` del manifiesto.
- `enemies/`: retratos de enemigas por arquetipo: `goblin`, `miasma`, `beast`, `boss` o `forest`.
- `scenes/`: fondos por bioma: `village`, `path`, `landmark`, `camp`, `ruin` y `dungeon`.

Las rutas públicas deben ser locales a `/assets/umbra/`. No uses URL de terceros ni archivos originales innecesariamente grandes. El juego conserva un reemplazo visual si falta una imagen.
