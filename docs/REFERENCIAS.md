# Referencias técnicas

Recursos consultados para orientar la arquitectura del MVP. Son referencias de implementación y aprendizaje, no material para copiar íntegramente.

- [Telegram Mini Apps: documentación oficial](https://core.telegram.org/bots/webapps) — inicialización, `initData` y validación en servidor.
- [grammY](https://github.com/grammyjs/grammY) — framework TypeScript para bots de Telegram.
- [Telegram Mini App Quickstart](https://github.com/nikandr-surkov/telegram-miniapp-quickstart) — referencia de estructura para frontend de Mini App.
- [Telegram Mini App con Vite/React](https://github.com/softstack/telegram-mini-app) — ejemplo adicional de estructura web.
- [Godot Open RPG de GDQuest](https://github.com/gdquest-demos/godot-open-rpg) — referencia conceptual para sistemas RPG; no es la tecnología inicial elegida.
- [Card Combat System](https://github.com/JavierIslas/Card-Combat-System) — referencia para estudiar estructuras de combate con cartas.
- [Deckbuilder template](https://github.com/sundowns/deckbuilder-template) — referencia de diseño para un constructor de mazos.

## Decisión del proyecto
Para el MVP de UMBRA se prioriza TypeScript + Vite + Express + grammY + SQLite. Godot queda como opción futura si el juego necesita una capa de acción o animación que justifique ese motor. La documentación oficial de Telegram es la fuente principal para autenticación y comportamiento de Mini Apps.
