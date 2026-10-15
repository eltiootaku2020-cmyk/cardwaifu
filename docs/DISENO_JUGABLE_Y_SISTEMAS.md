# UMBRA: Card Frontier — Diseño jugable y sistemas

Estado: propuesta de diseño para implementar por etapas. Las decisiones que ya constan en CEREBRO_Y_OBRERO.md prevalecen; los valores nuevos de este documento son parámetros iniciales y pueden ajustarse.

## Identidad del juego

UMBRA es un RPG anime de cartas para Telegram Mini App: aventura narrativa, exploración por rutas, combate por turnos, heroínas conscientes vinculadas a epopeyas, evolución táctica y mazmorras peligrosas. No es un juego comercial; aun así, el arte, los textos y el código del proyecto deben ser originales o tener permisos/licencias compatibles.

Las referencias son funciones de diseño, no plantillas para copiar:
- Fate/Grand Order: colección, historias episódicas, eventos y vínculos.
- WIXOSS: evolución que cambia decisiones durante el combate.
- Fate/kaleid liner Prisma☆Illya: manifestación de poderes heroicos mediante cartas.
- DanMachi: ciudad central, gremios, encargos, preparación y expediciones.
- Made in Abyss: exploración de lugares misteriosos, riesgo, descubrimientos y consecuencias.
- RPG de turnos clásicos: economía de acciones legible, roles complementarios, estados y sinergias.
- Juegos de exploración por nodos: elección de rutas y eventos con riesgo/recompensa, evitando mapas enormes vacíos.

## Ciclo principal

1. Regresar a una ciudad segura.
2. Hablar con heroínas y NPCs, aceptar encargos y consultar rumores.
3. Preparar cuatro espacios de equipo: arma, equipamiento 1, equipamiento 2 y apoyo objeto.
4. Elegir una ruta conectada hacia una zona de exploración.
5. Resolver un evento: encuentro, hallazgo, diálogo, refugio, obstáculo, comerciante o entrada a mazmorra.
6. Combatir cuando corresponda; gestionar vida, Ánima, estados y evolución.
7. Obtener experiencia, materiales, cartas o información.
8. Decidir si continuar explorando o volver a la ciudad.

La historia principal no debe quedar bloqueada por Alma. La falta de Alma impide actividades opcionales con coste, pero permite seguir la campaña principal y encuentros gratuitos.

## Inicio de partida

- El jugador elige protagonista hombre o mujer. La cámara siempre muestra espalda/silueta; nunca el rostro.
- Tutorial corto dentro de la ficción: llegada al bosque, primer peligro y primera decisión de ruta.
- Primera invocación: aleatoria dentro de un grupo inicial reducido, con protección contra resultados inválidos y una heroína consciente que habla y establece vínculo.
- La heroína inicial debe ser útil sin importar rareza. Las rarezas indican techo y especialización, no que una unidad inicial se vuelva inútil.
- Dar un equipo inicial legible y enseñar cada acción dentro de la primera batalla, sin ventanas de tutorial largas.
- El jugador empieza con Alma y Ánima claramente separadas: Alma pertenece al protagonista; Ánima se obtiene jugando y se acumula durante el combate.

## Combate: reglas iniciales

### Estructura
- Combate por turnos, una acción principal por combatiente activo y orden de turno visible.
- Para el MVP: una heroína activa contra 1–3 enemigas. Los apoyos se añaden después de estabilizar la batalla individual.
- El jugador ve vida, escudo, Ánima, estados, intención del enemigo y orden de turno.
- Acciones base: Ataque, Habilidad, Defender, Evadir, Cargar y Evolucionar.
- Enemigas tienen un patrón legible: atacar, preparar golpe, proteger a otra, aplicar estado, huir o pedir refuerzos según especie y contexto.
- La batalla termina al cumplir la condición del encuentro; no se ejecutan contraataques después de que el enemigo ya fue derrotado.

### Decisiones tácticas
- Ataque: daño estable y ganancia moderada de Ánima.
- Habilidad: efecto más fuerte o especializado, con coste, enfriamiento o condición según personaje.
- Defender: reduce el próximo daño y puede proteger a una aliada.
- Evadir: evita un ataque anunciado, pero falla contra ataques de área o que rastrean.
- Cargar: gana Ánima, sacrificando presión ofensiva durante ese turno.
- Evolucionar: requiere 60 Ánima y 25 Alma; solo una evolución por batalla. La acción exige elegir Light o Dark cuando la portadora puede usar ambas ramas. Lily→Hero fija la rama; Hero→Epic conserva esa misma rama en otra batalla. Epic es la forma final.
- La rama Light prioriza aguante: +8 ATQ y +20 vida máxima en el prototipo actual. La rama Dark prioriza daño: +13 ATQ y +10 vida máxima. Son valores iniciales de balance, no números sagrados. Una heroína sin acceso Dark no puede elegir esa rama; no se puede cambiar de rama durante la evolución normal.
- El daño debe ser predecible en lo esencial; el azar aporta variación acotada. La preparación y las decisiones deben superar a la suerte en la mayoría de encuentros.

### Principios de dificultad justa

El análisis de investigación y el plan de pruebas están en [docs/ANALISIS_DIFICULTAD_JUSTA.md](./ANALISIS_DIFICULTAD_JUSTA.md). Se aplican estas reglas al diseño de encuentros:

- Cada enemiga peligrosa expone una intención legible, un objetivo o zona probable y una forma razonable de responder. La información debe proceder del estado del servidor.
- Las acciones base han de tener usos distintos; si una habilidad es mejor en daño, curación y generación de Ánima a la vez sin coste, no existe una decisión real. Reequilibrar antes de subir las estadísticas enemigas.
- Aumentar la dificultad mediante roles y combinaciones —apoyo, cazadora, guardiana, amenaza cargada, corrupción— antes que mediante esponjas de HP. Introducir una mecánica nueva cada vez y luego combinar las ya aprendidas.
- Alternar tensión y alivio en la curva: encuentros de aprendizaje, enfrentamientos normales, combinaciones tácticas, descansos/recompensas, élites opcionales y jefes. Los valores orientativos de turnos y tasas de victoria son hipótesis para playtest, no balance final.
- La derrota no elimina cartas ni materiales raros, no borra descubrimientos y no consume Alma al reintentar encuentros obligatorios de historia. Después de derrotas repetidas, ofrecer pistas y preparar mejor al jugador; no ajustar enemigos a escondidas.
- El RNG debe crear variedad, no invalidar decisiones. Cuando falla la suerte, el jugador debe conservar alguna forma de progreso garantizado en botín, materiales, fragmentos o aprendizaje.

### Prueba de progresión del protagonista S frente a una carta SR

La S del protagonista podrá recibir duplicados y tendrá costes de ascensión crecientes, mostrados antes de confirmar y ganables también mediante juego. No debe necesitar duplicados para completar la historia principal. La SR debe ser más sencilla de desarrollar usando recursos comunes, sin convertir la carta S en una mala inversión por ser cara.

La comparación se hará en encuentros y condiciones equivalentes, midiendo victoria/derrota, turnos, daño recibido, recursos usados, mejoras necesarias y comprensión del patrón enemigo. Se probarán tanto inversión equivalente como tiempo/recursos equivalentes. Si la S base no resulta viable o la SR borra todo valor táctico de la S, se ajustan costes, función y mejoras antes de aumentar el HP de los enemigos. Los costes y metas concretas permanecen pendientes de los resultados.

### Estados de combate sugeridos
- Veneno: daño al final del turno durante varios turnos.
- Quemadura: daño periódico, con interacción contra enemigos vegetales o aceitosos.
- Congelación: reduce velocidad o impide una acción, con inmunidad parcial en jefes.
- Ruptura: reduce defensa después de ataques de impacto.
- Expuesta: el próximo golpe fuerte recibe bonus.
- Protección: absorbe daño antes de la vida.
- Miasma: efecto de corrupción; acumularlo aumenta peligro y puede alterar patrones. No toda criatura corrupta pierde la razón.
Los estados deben tener icono, duración y explicación corta. Jefes no deben quedar permanentemente incapacitados por control de masas.

## Heroínas, epopeyas y vestiduras

- Formas exactas: Lily → Hero → Epic. Sin cuarta forma.
- Hero Light/Dark y Epic Light/Dark son ramas de la manifestación, no nuevas etapas.
- La misma epopeya puede elegir a portadoras diferentes. La vestidura comparte silueta, símbolos y lenguaje visual de la leyenda, pero se mezcla con el cuerpo, la personalidad, el oficio y la ropa cotidiana de cada portadora.
- Una carta de mayor rango puede canalizar más poder, pero no convierte automáticamente a su portadora en mejor persona ni en mejor estratega.
- Vestiduras cotidianas (por ejemplo, uniforme de cafetería de conejita) pueden fusionarse con la epopeya durante el combate y volver a su estado normal al terminar.
- La mayoría de vestiduras son cosméticas; las excepcionales pueden modificar una habilidad o pasiva, pero deben identificarse claramente y no crear presión de colección innecesaria.
- Variantes jugables de una epopeya son distintas de los atuendos cosméticos.
- La influencia mental de la epopeya queda pendiente de aprobación; no convertirla en canon hasta que el usuario elija temporal, permanente o mixta.
- Regla visual: toda entidad representada como personaje será waifu femenina, incluidas enemigas, jefas, monstruos y apoyos; armas son la excepción.

## Equipamiento, accesorios y apoyos

Cuatro espacios precombate:
1. Arma: define el estilo base o un modificador de ataque.
2. Equipo defensivo: vida, defensa, resistencia a estado.
3. Accesorio: velocidad, crítico, precisión, resistencia o sinergia de clase.
4. Apoyo objeto: consumible o pasiva limitada por batalla.

No añadir decenas de slots antes del MVP. Cada objeto debe tener una función identificable. Los accesorios deben incluir opciones de estilo: supervivencia, velocidad, generación de Ánima, resistencia al Miasma, crítico o apoyo de equipo.

Heroínas de apoyo y Corazones Heroicos son sistemas distintos:
- Heroína de apoyo: personaje invocable que aporta una habilidad o asistencia y ocupa capacidad de equipo.
- Corazón Heroico: carta de recuerdo/objeto/escena con pasivas y sinergias, no una heroína adicional.
Los duplicados ofrecen elección entre mejorar una unidad y convertirlos en materiales.

### Progresión del protagonista S y balance comparativo S/SR
- El protagonista tiene su propia carta de rareza S y puede recibir duplicados de ella. No son varios protagonistas en la historia: las copias se consumen como vínculo/resonancia para mejorar la carta principal.
- Cada nuevo escalón de ascensión costará progresivamente más; la curva final se decidirá mediante pruebas y no se fijará por intuición. Los duplicados no sustituyen al resto del progreso: también cuentan XP/nivel, Ruptura de Límite con materiales, equipo, cartas de apoyo y mejora de las heroínas vinculadas.
- El power creep debe quedar integrado de forma gradual: enemigos y regiones posteriores piden mayor inversión, combinaciones y decisiones tácticas, no solo inflación de HP/ATQ. La ruta S es de inversión a largo plazo; debe seguir siendo viable y tener una identidad propia.
- Se hará una prueba controlada comparando la carta S del protagonista con una carta SR en el mismo encuentro, con equipo y recursos equiparables. Registrar victorias/derrotas, turnos de combate, daño recibido, consumos y número de mejoras necesarias. La ruta SR debe sentirse más accesible y facilitar el avance inicial; la S tiene más exigencia de inversión por su progresión de rango S, sin ser débil por definición.
- Los umbrales de duplicados, los costes crecientes, las bonificaciones por ascensión y los valores exactos del ensayo son parámetros pendientes de balance. No se marcan como implementados hasta que la colección y la mejora persistente existan en el código.

## Exploración por nodos

Cada región es un grafo de lugares conectados, no una lista de mazmorras aisladas. Un nodo tiene tipo, peligro, posibles eventos, coste de viaje y conexiones. El jugador decide entre:
- ruta segura y lenta;
- ruta peligrosa con mejores recompensas;
- desvío opcional por historia, tesoro o rescate;
- regreso a refugio/ciudad.

Los nodos pueden incluir sendero, aldea, puesto de vigilancia, ruina, cueva, nido, manantial, campamento, comerciante, evento narrativo, jefe y acceso de mazmorra. Los eventos se seleccionan de una tabla con reglas, no únicamente al azar puro. Una región inicial pequeña debe demostrar el sistema antes de generar mapas grandes.

## Progresión y economía

- Nivel máximo 100.
- Experiencia hasta el límite; romper límites en 10→11, 20→21 y sucesivos hitos usando materiales.
- Alma: recurso del protagonista para acciones específicas; regeneración y costes siguen tentativos hasta balance.
- Ánima común: combate/progreso; Ánima premium: recurso escaso, con advertencia antes de gastar en usos que se pueden obtener jugando.
- No vender poder como requisito para completar historia. Si existieran compras en el futuro, no serían parte del MVP.
- Recompensas: XP, materiales, monedas/recursos, nuevas cartas, afinidad, fragmentos de historia y desbloqueo de rutas.
- Derrota: pérdida de tiempo/recompensa o regreso al último refugio según actividad; no borrar heroínas ni progreso permanente. La campaña principal debe poder retomarse.

## Modos y alcance

### MVP
- Una región: bosque oscuro, una aldea, una ciudad y una mazmorra inicial.
- Un bucle de combate servidor-autoritativo.
- Primera invocación y colección persistente.
- Equipo de cuatro slots.
- Rutas y encuentros.
- Progreso guardado y reanudación tras reinicio.
- Una heroína vinculada y una pequeña familia de goblins enemigas, con variaciones de función.
- Telegram Mini App y bot básicos, una vez configurados URL y token en entorno seguro.

### Después del MVP
- Equipo completo y heroínas de apoyo.
- Jefes con fases y cooperación.
- Eventos de temporada y vestiduras.
- Redención y reclutamiento de heroínas Dark.
- Gremios, intercambio controlado y drops comunitarios.
- PvP solo después de estabilizar PvE, economía y antitrampas.

## Arquitectura y seguridad

- Cliente TypeScript/Vite; API Express; bot grammY; SQLite para prototipo.
- El servidor valida identidad Telegram y es autoridad sobre inventario, recursos, combate, recompensas y permisos.
- No guardar BOT_TOKEN en frontend ni en localStorage.
- Persistir batalla y progreso con transacciones; operaciones de recursos deben ser atómicas para evitar doble gasto en acciones simultáneas.
- Añadir migraciones, límites de frecuencia, backups, logs sin secretos y validación de payloads.
- Las pruebas automáticas son una herramienta interna para detectar regresiones, no una tarea que el usuario tenga que ejecutar manualmente.
- La integración real exige URL HTTPS desplegada, BOT_TOKEN privado y configuración en BotFather; no se debe afirmar que está online hasta que exista despliegue y validación real.

## Presentación visual y efectos de combate

La capa visual del combate sigue una dirección de fantasía oscura y arcana: fondos profundos, bruma, anillos rúnicos y destellos cian/violeta, con acentos dorados para Light y rosa/carmesí para Dark. El contraste debe mantener legibles las barras, el texto y los números en pantalla pequeña.

- **Invocación:** la primera carta elegida recibe una revelación breve con sello arcano y brillo ligado a su rareza. La ceremonia solo aparece si el servidor confirma que se creó un vínculo nuevo; restaurar una partida no vuelve a gastar ni a revelar la invocación.
- **Heroína y enemiga:** cada una se presenta en un panel de combate con silueta, emblema, HP y datos de combate. La apariencia visual del enemigo cambia por familia (goblin, criatura contaminada, miasma o amenaza mayor). Las siluetas CSS son marcadores temporales originales y pueden reemplazarse por el arte que aporte el proyecto.
- **Escenario:** la niebla, los árboles, los anillos de luz y la paleta cambian según el tipo de nodo explorado, para relacionar el encuentro con bosque, campamento, ruinas, aldea o mazmorra.
- **Números de daño:** el cliente lee la cifra concreta del registro de combate generado por el servidor y usa los cambios de HP confirmados para decidir a quién mostrarla. Si una habilidad cura y luego llega un contraataque, se presentan por separado la curación efectiva y el daño real; las barras reflejan el HP final del servidor.
- **Ataques y poderes:** cada acción tiene una respuesta visual propia: avance y retroceso para ataques, destello para habilidades, pulso defensivo, desplazamiento de evasión, carga de Ánima y despertares diferenciados de Light/Dark.
- **Cámara e impacto:** el escenario recibe un movimiento breve al confirmarse daño y aparecen partículas en el panel afectado. La derrota enemiga cambia su presentación, sin modificar por sí misma reglas, estadísticas ni recompensas.
- **Accesibilidad y dispositivos:** los efectos se adaptan a móvil y respetan la preferencia del sistema para reducir movimiento. La animación no debe ocultar los registros de combate ni sustituir la confirmación del servidor.

La integración visual no incluye todavía ilustraciones finales ni cinemáticas dibujadas cuadro a cuadro; deja una base funcional para conectarlas cuando estén preparados los recursos artísticos originales.

## Referencias consultadas

- Telegram Mini Apps: https://core.telegram.org/bots/webapps — aplicación web alojada, integración y datos de lanzamiento.
- Telegram Mini Apps, almacenamiento: https://docs.telegram-mini-apps.com/packages/tma-js-sdk/features/device-storage — diferencia entre almacenamiento local, seguro y cloud.
- Game Developer, “12 ways to improve turn-based RPG combat systems”: https://www.gamedeveloper.com/design/12-ways-to-improve-turn-based-rpg-combat-systems — claridad, decisiones y herramientas tácticas.
- Exploración procedural, documento de diseño abierto: https://github.com/koalabuttz/roguelike/blob/master/docs/design/procgen-exploration.md — generación y estructura de mapas, consultado como referencia conceptual, no como código para copiar.
- Documentación de diseño de UMBRA: docs/ARQUITECTURA.md, docs/LORE_Y_DISENO.md y CEREBRO_Y_OBRERO.md.

Las referencias sirven para estudiar principios y restricciones técnicas. No implican que el código, el arte, los personajes o los textos de esas fuentes se incorporen al proyecto.
