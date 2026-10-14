# UMBRA — Taller de cartas

## Objetivo
Crear cartas originales de monstruos/mobs, personajes, armas, equipamiento y Corazones Heroicos a partir de una imagen con transparencia. El editor debe funcionar sin servicios externos para la composición, para mantenerlo ligero y facilitar el uso en PC modestas.

## Flujo de creación
1. Crear o conseguir una ilustración original; preferir PNG RGBA transparente.
2. Cargarla en el editor.
3. Elegir tipo de carta, rareza, elemento y plantilla.
4. Ajustar escala/encuadre del arte; el editor conserva la transparencia y compone la ilustración sobre el fondo.
5. Editar nombre, ATQ y HP/poder.
6. Exportar a PNG y guardar el registro de la carta en el catálogo del juego.

## Principios técnicos
- Composición local en navegador con Canvas 2D; no subir imágenes del usuario a un servidor.
- Plantillas originales dibujadas por código/SVG/Canvas, no copiar marcos comerciales ni de otros juegos.
- Escala automática inicial con contain y ajuste manual.
- Exportación PNG a 600×900 para prototipo; definir tamaños finales antes de producción.
- La biblioteca de imágenes y las estadísticas deben ser datos separados del renderizador de carta.
- Añadir posteriormente importación/exportación JSON/CSV, generación por lotes, variantes de rareza y registro de licencia/procedencia.
- Si el archivo no tiene transparencia, avisar que debe removerse el fondo; la eliminación automática de fondo sería un módulo separado.

## Arte IA y hardware modesto
- Para generar arte localmente, ComfyUI tiene modos de baja VRAM y CPU, pero CPU puede ser muy lento. Stable Diffusion 1.x indica como referencia una GPU de al menos 10 GB VRAM en su implementación original; por eso no debe ser requisito para el editor.
- Mantener el editor independiente del generador: la generación puede hacerse en una máquina distinta o servicio externo, y luego se importan PNG.
- No hay garantía universal de que una imagen generada sea jurídicamente “libre de copyright”. Revisar licencia del modelo, de los pesos, del servicio y de cualquier LoRA; no usar nombres, logos, personajes ni diseños reconocibles de franquicias ajenas.
- Para remover fondos localmente, rembg ofrece licencia MIT para el código y opciones CPU/GPU, pero cada modelo de segmentación tiene su propia licencia. El modelo por defecto BiRefNet/RMBG-2.0 requiere revisar condiciones comerciales; U2Net puede ser una opción más liviana, comprobando su licencia y calidad.

## Fuentes consultadas
- ComfyUI: https://github.com/comfyanonymous/ComfyUI — admite argumentos de bajo consumo de VRAM/CPU.
- Stable Diffusion: https://github.com/CompVis/stable-diffusion — documentación del modelo y CreativeML OpenRAIL-M.
- rembg: https://github.com/danielgatis/rembg — eliminación de fondo, licencia MIT del código; modelos con licencias independientes.
- Marcos originales de cartas: https://github.com/Dwsy/svg-card-generator — generador SVG/PNG con licencia MIT, útil como referencia técnica, no para copiar el diseño visual sin revisión.
- Muestra comercial de mobs anime generados con IA: https://sceneforgestudio.itch.io/sf011-bright-fantasy-monsters-25 — pack comercial de 25 mobs PNG transparentes; revisar el archivo de licencia incluido antes de incorporarlo al juego.
- Marcos TCG de referencia: https://steadykeel.itch.io/tcg-card-frames-v1 — uso en productos terminados permitido según la página, pero no redistribuir los archivos de plantilla. No es necesario comprarlo para crear marcos propios.

## Próximas tareas
- Integrar el editor con la interfaz de Mini App.
- Añadir catálogo de cartas y persistencia en servidor.
- Añadir generación por lotes desde JSON/CSV y exportación de paquetes PNG.
- Probar imágenes con transparencia, imágenes grandes, nombres largos, tamaños móviles y exportación.
- Auditar licencias de cada modelo y recurso antes de usarlo en una versión comercial.
