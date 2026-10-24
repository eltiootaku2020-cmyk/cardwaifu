# Arte 2D de UMBRA

Este directorio contiene el registro del arte que la interfaz puede cargar. No requiere un motor 3D ni subir las imágenes a un servicio externo.

## Cómo añadir ilustraciones

1. Conserva siempre el original fuera del juego como copia maestra.
2. Añade una copia optimizada dentro de este directorio. Para retratos usa preferentemente PNG con transparencia; para fondos puede usarse PNG o WebP.
3. Edita `manifest.json` y sustituye el `null` de la entrada correspondiente por la ruta pública, por ejemplo `/assets/umbra/characters/juana.png`.
4. Si la entrada queda en `null), el juego usa su diseño de reserva. No se intenta descargar una imagen inexistente.

## Rutas sugeridas

- `characters/`: retratos de portadoras. El nombre debe coincidir con una clave de `characters` en el manifiesto.
- `enemies/`: retratos de enemigas según arquetipo: `goblin`, `miasma`, `beast`, `boss` o `forest`.
- `scenes/`: fondos por bioma: `village`, `path`, `landmark`, `camp`, `ruin` y `dungeon`.

Las rutas se declaran en el manifiesto antes de que la interfaz las cargue. La interfaz valida que cada ruta pertenezca a `/assets/umbra/` y que tenga una extensión de imagen admitida.

## Reglas de peso y privacidad

- El juego no descarga imágenes desde URLs de terceros; usa archivos del propio repositorio.
- No añadas archivos enormes de imagen original si una copia optimizada sirve.
- Carga arte solo en las pantallas que lo necesitan y conserva un reemplazo cuando falta una imagen.
- El arte se muestra como una capa 2D. El movimiento de la ilustración completa y los efectos CSS no necesitan recortar o animar articulaciones.
