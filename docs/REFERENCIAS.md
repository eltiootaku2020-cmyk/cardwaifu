# Referencias técnicas

Recursos consultados para orientar la arquitectura del MVP. Son referencias de implementación y aprendizaje, no material para copiar íntegramente.

- [Telegram Mini Apps: documentación oficial](https://core.telegram.org/bots/webapps) — inicialización, `initData` y validación en servidor.
- [grammY](https://github.com/grammyjs/grammY) — framework TypeScript para bots de Telegram.
- [Telegram Mini App Quickstart](https://github.com/nikandr-surkov/telegram-miniapp-quickstart) — referencia de estructura para frontend de Mini App.
- [Telegram Mini App con Vite/React](https://github.com/softstack/telegram-mini-app) — ejemplo adicional de estructura web.
- [Godot Open RPG de GDQuest](https://github.com/gdquest-demos/godot-open-rpg) — referencia conceptual para sistemas RPG; no es la tecnología inicial elegida.
- [Card Combat System](https://github.com/JavierIslas/Card-Combat-System) — referencia para estudiar estructuras de combate con cartas.
- [Deckbuilder template](https://github.com/sundowns/deckbuilder-template) — referencia de diseño para un constructor de mazos.

## Referencia visual: generadores de arte anime

### Opción principal: PixAI
- Sitio: https://pixai.art/
- Galería: https://pixai.art/
- Motivo: plataforma centrada en arte anime, con galería comunitaria, modelos y LoRA compartidos; adecuada para explorar conceptos de waifus caballeras, heroínas, monstruos femeninos, demonios y jefas.
- Escala comunitaria: su web oficial anuncia millones de usuarios globales y millones de modelos LoRA públicos. Las cifras exactas pueden cambiar y deben volver a comprobarse antes de citarlas en material público.
- Términos: https://pixai.art/en/terms
- Regla de uso: los términos de PixAI indican que el contenido generado por el propio usuario puede utilizarse por este, pero las imágenes descargadas o copiadas de otros usuarios siguen sujetas a los términos aplicables y a las condiciones del creador. No asumir que una imagen visible en la galería está libre para reutilización.

### Alternativa: SeaArt
- Sitio: https://www.seaart.ai/
- Guía oficial de preguntas frecuentes: https://docs.seaart.ai/guide-1/espanol/7-preguntas-frecuentes
- Motivo: generador con modelos, herramientas y comunidad para explorar estilos y prompts.
- Regla de uso: la guía distingue entre obras propias y obras de otros usuarios; para usar obras ajenas hace falta autorización del titular cuando corresponda. Revisar también las condiciones específicas del modelo.

### Referencia adicional: NovelAI
- Sitio: https://novelai.net/
- Documentación de derechos y uso: https://docs.novelai.net/en/faq/
- Motivo: generador anime útil para crear ilustraciones originales. No es la primera opción para una biblioteca comunitaria, ya que su documentación indica que no funciona como plataforma de publicación/compartición de imágenes.

## Protocolo de biblioteca visual de UMBRA
1. Usar galerías públicas para estudiar diseño, composición, armaduras, siluetas, paletas, expresiones, poses y prompts; no descargar masivamente ni copiar obras ajenas como assets del juego.
2. Para la biblioteca de producción, priorizar imágenes generadas por nosotros y conservar prompt, modelo, fecha y condiciones de licencia del modelo utilizado.
3. Si se propone una obra de un usuario como referencia, registrar enlace y autor; no integrarla en el juego sin permiso explícito o licencia compatible.
4. La marca de agua no sustituye el permiso ni transforma una obra ajena en material autorizado. En arte propio o autorizado, colocar la leyenda de estudio/no comercial en el borde inferior, lejos de la cara y de elementos visuales importantes.
5. Antes de publicar o monetizar, comprobar términos vigentes de la plataforma y licencia del modelo/LoRA; evitar modelos con licencia no comercial o ambigua para assets que podrían acabar en un juego comercial.

## Decisión del proyecto
Para el MVP de UMBRA se prioriza TypeScript + Vite + Express + grammY + SQLite. Godot queda como opción futura si el juego necesita una capa de acción o animación que justifique ese motor. La documentación oficial de Telegram es la fuente principal para autenticación y comportamiento de Mini Apps.
