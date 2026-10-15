# UMBRA: dificultad justa — investigación y plan de balance

**Fecha:** 15 de octubre de 2026  
**Estado:** análisis de diseño con primera implementación parcial en `src/game/combat.ts`; el balance sigue siendo provisional y requiere simulaciones y pruebas de juego.  
**Objetivo:** hacer UMBRA exigente, táctico y rejugable sin convertirlo en una rutina pesada, una pared de estadísticas o una obligación de conseguir duplicados.

## Conclusión ejecutiva

La dificultad que conviene a UMBRA debe venir de **leer amenazas, elegir cuándo atacar o defender, priorizar objetivos, combinar cartas y aprender patrones**. El jugador puede perder, pero después debe entender por qué y disponer de una forma razonable de mejorar su siguiente intento.

La regla de oro es:

> **Que el jugador piense «ahora sé cómo vencerla», no «necesito repetir diez veces o sacar una carta al azar».**

La investigación converge en cinco ideas: introducir dificultad gradualmente con picos y descansos; comunicar los ataques peligrosos antes de resolverlos; dejar que las decisiones compensen la suerte; combinar métricas de juego con comentarios de personas; y mantener rutas de progreso garantizadas incluso cuando la invocación no da lo esperado. Las fuentes describen principios, no una fórmula universal; los números objetivo que siguen son hipótesis para probar en UMBRA, no leyes de la industria.

## 1. Lo que encontré al revisar el prototipo actual

El núcleo en `src/game/combat.ts` es útil para comenzar, pero por ahora permite repetir una acción que supera con claridad a las demás.

### La habilidad domina al ataque normal

Con los valores iniciales de ejemplo —heroína con 24 ATQ y una enemiga de 82 HP—:

| Acción | Daño aproximado por uso | Otros beneficios | Coste actual |
|---|---:|---|---|
| Ataque | 24–32 | +12 Ánima | Ninguno |
| Habilidad | 40–47 | Cura hasta 8 HP y +18 Ánima | Ninguno |
| Defender | 0 | Reduce 8 puntos del contraataque | Recibe igualmente el golpe restante |
| Evadir | 0 | Anula el próximo contraataque | Consume la acción |
| Cargar | 0 | +25 Ánima | Recibe contraataque si la enemiga sigue viva |

Los rangos salen de las llamadas actuales a `randomInt` (límite superior exclusivo). Con esos valores, dos habilidades infligen al menos 80 de daño y suelen derrotar a la enemiga de 82 HP; dos ataques normales no pueden hacerlo, porque infligen como máximo 64. La habilidad también cura y genera más Ánima, y no tiene coste ni enfriamiento. Por tanto, la decisión óptima tiende a ser repetir habilidad; atacar, defender o cargar parecen opciones inferiores salvo situaciones particulares.

**Recomendación:** antes de crear muchas cartas o aumentar la vida de las enemigas, equilibrar las acciones para que cada una tenga un motivo real de uso. No hace falta que todas hagan el mismo daño: hace falta que resuelvan problemas diferentes. Por ejemplo, el ataque puede ser fiable y generar Ánima; la habilidad puede ser más potente, pero depender de un recurso, enfriamiento, condición o función específica de la heroína; defender tiene que ser valioso frente a un golpe anunciado; evadir debe responder a ciertos ataques, no ser una elección vacía.

### Los enemigos todavía no plantean preguntas tácticas distintas

El prototipo hace que una sola enemiga ataque de forma parecida después de casi cualquier acción del jugador. La interfaz no muestra todavía una intención de ataque autoritativa. Si la siguiente versión aumenta solo HP y ATQ, prolongará el mismo intercambio en lugar de añadir decisiones.

**Recomendación:** diseñar cada enemiga con una función reconocible y al menos una conducta que el jugador pueda leer y contrarrestar. Después mezclar esas funciones en encuentros pequeños.

## 2. Cómo debe sentirse una dificultad justa

### A. Comunicar el peligro sin regalar la victoria

Las amenazas peligrosas deben tener una señal legible: intención, objetivo probable y tipo de efecto. La incertidumbre puede estar en qué hace el jugador ante la amenaza, no en descubrir después de recibir un golpe letal que había una amenaza sin aviso. El diseño de *telegraphing* recomienda hacer comprensible la pregunta que cada enemigo plantea y dejar una oportunidad de responder antes del impacto.

En UMBRA, una intención puede mostrarse así:

- **Ataque rápido:** objetivo señalado; daño bajo o medio. Es peligroso si el jugador ignora repetidamente la presión.
- **Golpe cargado:** la goblin guardiana prepara su lanza; el próximo golpe será fuerte. Defender o evadir reduce el daño, mientras que otra respuesta podría interrumpirla si se cumplen condiciones.
- **Marca de cazadora:** la goblin cazadora marca a una portadora; el turno siguiente intenta una emboscada. Cambiar el objetivo, cubrir o derrotar a la cazadora son posibles respuestas.
- **Miasma acumulándose:** la guardiana del Abismo pasa un turno preparando una zona corrupta. El jugador puede debilitarla, interrumpirla o preparar protección.
- **Defensa territorial:** la goblin guardiana protege a otra enemiga, cambiando el orden de objetivos más eficiente.

No todos los ataques tienen que anunciar su daño exacto. Para los movimientos peligrosos sí debe quedar claro el tipo de riesgo, el objetivo y cuánto tiempo hay para reaccionar. La señal no puede ser solamente un color: usar texto o iconos reconocibles también ayuda a distinguir amenazas.

### B. Hacer que los turnos sean elecciones reales

Cada acción debe ganar en alguna situación y ceder en otra:

- **Atacar:** respuesta estable, buena para mantener presión y preparar la próxima evolución.
- **Habilidad:** ventaja situacional definida por la heroína —romper defensa, curar, interrumpir, aplicar un estado, atacar varios objetivos— en lugar de ser siempre un ataque más grande y gratuito.
- **Defender:** mejor contra el golpe anunciado; mediocre cuando no viene presión.
- **Evadir:** excelente contra un golpe grande y evitable, pero menos eficaz ante rastreo, daño periódico o área.
- **Cargar:** sacrifica una oportunidad ofensiva para alcanzar una habilidad o evolución próxima. Debe existir una razón clara para aceptar ese riesgo.
- **Evolucionar:** inversión visible que altera el plan de combate. No debe ser automáticamente superior en cada turno ni exigir siempre elegir la rama de daño máximo.

El enemigo también necesita ventanas de oportunidad: después de una embestida fallida, un escudo roto o una habilidad interrumpida debería quedar expuesto. Así la defensa no es solo esperar menos daño; también ayuda a crear una respuesta ofensiva.

### C. Dificultad por combinaciones, no por «esponjas de HP»

La variedad útil sale de combinar funciones complementarias, no de poner cinco enemigas idénticas:

- una enemiga que prepara ataques fuertes;
- una que apoya, cura o refuerza;
- una que aplica una condición;
- una guardiana que obliga a reconsiderar el objetivo;
- una exploradora que observa, marca o intenta retirarse en vez de combatir siempre.

El jugador debería preguntarse «¿a quién elimino primero y qué ataque necesito responder?». Esto genera dificultad táctica sin que cada enemigo necesite una barra de vida enorme. Introducir **una regla nueva por vez**, enseñar una respuesta y después combinar reglas ya conocidas. En la familia goblin, no todas deben ser hostiles: una exploradora puede dar una advertencia, huir o abrir un camino; eso también hace que las decisiones importen fuera del combate.

### D. Subidas y descansos en vez de una cuesta infinita

La curva recomendada tiene ciclos pequeños: aprendizaje, presión, clímax y alivio. Después de un combate difícil debe haber un descubrimiento, una conversación, una recompensa relevante o un lugar para prepararse. La región puede alternar entre un sendero seguro y un desvío peligroso con mejores materiales.

Como punto de partida para probar, no como regla fija:

| Tipo de encuentro | Duración orientativa | Qué debe comprobar |
|---|---:|---|
| Primeras peleas/tutorial | 2–4 turnos | Aprender acciones sin quedar bloqueado |
| Combate normal | 3–5 turnos | Usar una decisión útil y reconocer el rol enemigo |
| Élite/opcional | 5–8 turnos | Combinar varias respuestas y recompensar preparación |
| Jefe | 6–10 turnos o fases breves | Reconocer patrones, adaptarse y sentir progreso |

Si un combate normal se alarga sin introducir una decisión nueva, probablemente estamos usando demasiado HP. Si el jefe supera esos tiempos, debe ser porque cambia su patrón o crea decisiones nuevas, no porque repita el mismo ataque más veces.

## 3. Suerte y gacha: el azar necesita una salida

UMBRA necesita RNG: las invocaciones han de ser emocionantes y los encuentros no deben ser idénticos. Pero conviene separar dos clases de aleatoriedad:

- **En combate:** variaciones acotadas de daño y situaciones que el jugador puede contrarrestar. Evitar que una racha aleatoria decida una batalla que estaba bien jugada, especialmente si el ataque no fue anunciado. No usar fallos aleatorios frecuentes que hagan perder un turno entero sin posibilidad de respuesta.
- **En gacha y botín:** el resultado puede ser aleatorio, pero el progreso no. Añadir una vía garantizada para conseguir materiales o fragmentos específicos, convertir duplicados sobrantes en recursos útiles y mostrar los costes antes de confirmar. La compensación debe ser un avance real, no solo una moneda decorativa.

El ciclo de gacha puede reforzarse a sí mismo —jugar, ganar recursos, invocar, mejorar y abordar contenido más difícil—, pero también puede volverse un bucle frustrante si la única salida a un obstáculo es obtener una unidad o pagar. UMBRA debe preservar una ruta que avance jugando y nunca bloquear la historia principal por falta de Alma, una unidad concreta o duplicados.

## 4. Protagonista S frente a carta SR

La comparación entre las dos rutas es valiosa, pero plantea un riesgo: en el orden de rarezas actual, S está por debajo de SR. Si el protagonista S cuesta mucho más mejorar y no ofrece ninguna ventaja propia sin duplicados, el jugador puede percibirlo como una penalización, no como una inversión especial.

### Regla de diseño propuesta

- El protagonista S debe ser **viable desde su primera versión para completar la historia principal**. Los duplicados aumentan su techo y desbloquean mejoras o alternativas útiles; no deben ser una llave obligatoria para pasar el capítulo.
- La curva ascendente de duplicados debe mostrarse de forma transparente. El carácter «oculto» de la progresión puede estar en una escalada orgánica del desafío; **no** en esconder costes, manipular probabilidades o aumentar secretamente los precios cuando el jugador se atasca.
- Cada ascensión debe ofrecer una mejora significativa —nueva decisión, utilidad, sinergia o mejora de habilidad—, no únicamente un pequeño aumento que pronto quede obsoleto.
- Tiene que existir un camino determinista, aunque sea lento, para ganar progreso de la carta S jugando. Los materiales alternativos o fragmentos pueden requerir tiempo, pero no han de ser exclusivos de pago.
- La SR debe sentirse más fácil de desarrollar con recursos comunes y ofrecer una ruta razonable de avance temprano. No por eso debe borrar la identidad de la S: esta puede compensar su coste con una herramienta propia o una sinergia a largo plazo.

### Prueba S/SR que recomiendo ejecutar

Comparar el avance en el mismo capítulo y contra los mismos encuentros, en dos escenarios: **coste de inversión equivalente** y **tiempo/recursos equivalentes**. Probar protagonista S sin duplicados, S con algunos hitos de resonancia y carta SR mejorada mediante materiales comunes. Mantener equivalentes el nivel general, el equipo y las condiciones del encuentro siempre que la comparación lo permita.

Registrar victorias/derrotas, turnos por combate, daño recibido, recursos consumidos, cantidad de mejoras y tiempo necesario para superar el tramo. Preguntar después si el jugador entiende por qué ganó o perdió y si la mejora obtenida fue perceptible.

Criterio de aceptación: el capítulo inicial puede completarse sin duplicados obligatorios; la SR permite progresar con menos inversión; y la S conserva una ruta útil y satisfactoria. Si la S exige repetir el mismo combate muchas veces antes de empezar a sentirse funcional, no se arregla simplemente dando más poder a la SR: hay que revisar la curva de costes, la utilidad base de la S o la recompensa de los encuentros.

## 5. Derrota sin castigo molesto

Una derrota debe consumir atención y enseñar algo; no borrar el progreso del jugador. Para UMBRA recomiendo:

- No perder heroínas, cartas, duplicados, materiales raros ni el progreso de la misión por perder un combate.
- No cobrar Alma por reintentar una pelea obligatoria de historia.
- Guardar el lugar descubierto, los diálogos y las pistas del patrón del enemigo, aunque el encuentro haya que repetirlo.
- En actividades opcionales, permitir decidir si retirarse con lo encontrado o arriesgarse a seguir por una recompensa adicional.
- Tras dos derrotas seguidas en una misma batalla de historia, mostrar una pista contextual que señale el patrón, equipo o acción que podría ayudar. No bajar secretamente los atributos del enemigo; ofrecer información y una decisión.
- Evitar tareas diarias que se sientan como obligación para no perder valor. Las recompensas repetibles deben ser un extra, no la llave para mantener viable al protagonista.

## 6. Cómo medir si resulta entretenido

Los números solos no indican diversión, y los comentarios solos tampoco identifican siempre la causa. Conviene combinar ambos enfoques: pruebas observadas, métricas y preguntas breves sobre lo que el jugador entendió. Los desarrolladores de *Slay the Spire* describieron cómo revisaban selecciones de cartas, presencia en mazos vencedores y daño sufrido frente a enemigos, y luego contrastaban los resultados con feedback cualitativo.

### Hipótesis iniciales para playtests

Estas bandas son **objetivos experimentales para el primer balance de UMBRA**, no cifras garantizadas por la investigación:

| Contenido | Objetivo tentativo |
|---|---|
| Primer combate que enseña las reglas | 90–98% lo supera en el primer intento |
| Encuentro normal con preparación apropiada | 70–85% de primeras victorias |
| Jefe principal del capítulo | 55–75% de primeras victorias; 80–90% antes o durante el tercer intento cuando el jugador aprende y se adapta |
| Élite opcional | 40–60% de primeras victorias; el juego debe advertir claramente que el riesgo es mayor |

No perseguir la tasa como un número aislado: un combate con 80% de victorias puede ser aburrido si todos pulsan la misma habilidad, y uno con 50% puede resultar injusto si las derrotas parecen arbitrarias.

### Datos mínimos por batalla

Registrar de forma proporcionada y respetuosa con la privacidad:

- Identificador/versionado del encuentro, arquetipo enemigo y nivel de dificultad previsto.
- Estado de la carta, nivel, rama, equipo y mejoras pertinentes.
- Acciones elegidas y repetidas; turnos hasta victoria o derrota; HP restante; daño causado y recibido; recursos utilizados.
- Cantidad de intentos, retiradas y puntos en que la persona deja la expedición.
- Uso y tasa de victoria por carta y equipo, segmentado por inversión para no confundir una carta poco elegida con una carta inútil.

No recopilar datos personales que no hagan falta. Para las pruebas tempranas, observar a unas pocas personas y preguntarles qué esperaban que ocurriera suele encontrar problemas de comprensión; después usar más partidas para comprobar si el patrón se repite.

### Señales de alarma

- Una acción representa casi todas las elecciones y ofrece mejores resultados en casi cualquier situación.
- Derrotas que ocurren antes de que el jugador pueda responder a un ataque anunciado.
- Mucha diferencia de victoria entre composiciones con inversión similar, sin una explicación táctica clara.
- Los jugadores repiten el mismo combate varias veces, pero su probabilidad de ganar no mejora porque no reciben una pista ni un progreso útil.
- Una carta SR o un duplicado particular se vuelve requisito práctico para superar una parte de la historia.
- El jugador consigue una mejora, pero no nota ninguna diferencia en el siguiente encuentro.
- Los jugadores abandonan siempre en el mismo tramo. Confirmar primero que no sea un error, un problema de interfaz o una recompensa poco clara antes de cambiar la dificultad.

## 7. Orden de trabajo recomendado

1. **Equilibrar las acciones actuales:** evitar que la habilidad sea la opción universal. Crear pruebas que comparen su daño, generación de Ánima, curación y coste con las otras acciones.
2. **Añadir intención enemiga en el servidor:** el cliente debe mostrar el estado real que resolverá el siguiente turno, no adivinarlo. Diseñar patrones pequeños y contrarrestables para exploradora, cazadora, guardiana y criatura contaminada.
3. **Construir una tabla de encuentros del Bosque Oscuro:** tutorial, normal, combinación de roles, alivio, élite y primer jefe; variar funciones antes que HP.
4. **Preparar simulaciones reproducibles:** repetir combates con semillas y condiciones controladas para encontrar extremos de RNG, acciones dominantes y picos de daño. Confirmar con pruebas humanas antes de aplicar ajustes.
5. **Implementar progresión y duplicados:** hacer que los costes ascendentes sean visibles, que el S sea viable sin copias y que haya una vía de progreso jugable.
6. **Comparar S y SR:** evaluar esfuerzo, efectividad, decisiones y sensación de progreso en condiciones equivalentes.
7. **Ajustar con datos y feedback:** no declarar el balance terminado por superar tests de código. Hace falta comprobar que las personas comprenden las señales, pueden aprender y quieren volver a intentarlo.

## Investigación consultada

### Fuentes de diseño y desarrollo
- Mike Stout, [Enemy Attacks and Telegraphing — Game Developer](https://www.gamedeveloper.com/design/enemy-attacks-and-telegraphing). El jugador debe comprender qué amenaza plantea el enemigo y recibir una señal adecuada antes de ataques importantes.
- Guy Agiv, [Difficulty curves: how to get the right balance — Game Developer](https://www.gamedeveloper.com/design/difficulty-curves-how-to-get-the-right-balance-) (24 de enero de 2024). Vincula el reto con habilidad/recursos y recomienda buscar señales como finalización y retención sin asumir una curva universal.
- Attila Branyiczky, [Doing Difficulty Right: Fractal Curves — Game Developer](https://www.gamedeveloper.com/design/doing-difficulty-right-fractal-curves). Explica un inicio suave, una subida sin paredes bruscas y pausas después de alcanzar nuevos umbrales de habilidad.
- Game Developer, [How Slay the Spire's devs use data to balance their roguelike deck-builder](https://www.gamedeveloper.com/design/how-i-slay-the-spire-i-s-devs-use-data-to-balance-their-roguelike-deck-builder) (27 de febrero de 2018). Describe medición de elecciones, cartas presentes en victorias y daño sufrido, combinada con feedback y ajustes iterativos.
- Wesley Rockholz, [Balancing Randomness with Player Choice — Game Developer](https://www.gamedeveloper.com/design/balancing-randomness-with-player-choice). Recomienda compensar el azar con control del jugador y progreso consistente.
- Lanie Dixon y Sebastian Long, [Difficult Games by Data and Design — GDC UX Summit](https://gdcvault.com/play/1034838/UX-Summit-Difficult-Games-by). Resume la necesidad de combinar analytics, QA, pruebas y experiencia cualitativa para evaluar dificultad.
- Microsoft, [Xbox Accessibility Guideline 108: Game difficulty options](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/108). Recomienda opciones de dificultad, ajustes diferenciados y guardado para que un bloqueo no impida disfrutar el resto del juego.
- [Gacha as an Economy and Product System — Game Design Lab](https://teemo.dev/game-design/concepts/gacha-games/systems/gacha-as-an-economy-and-product/). Es una referencia secundaria sobre la conexión entre jugar, obtener recursos, invocar, mejorar y volver a afrontar retos; destaca la diferencia entre una progresión sostenida y un bucle que se vuelve compulsivo.

### Opiniones comunitarias complementarias
- [RPGdesign: Combat balancing?](https://www.reddit.com/r/RPGdesign/comments/1ivjoaj/), discusión de diseñadores sobre ataques previsibles, objetivos prioritarios, caos del RNG y costes de derrota.
- [RPGdesign: Solutions for known problems in combat](https://www.reddit.com/r/RPGdesign/comments/1hhgz7j), ideas comunitarias para evitar que la opción de mayor daño al primer turno resuelva todos los encuentros y para añadir roles enemigos distintos.

Las discusiones comunitarias son opiniones y propuestas, no estudios controlados; se usan para generar hipótesis que después deben probarse. Las demás fuentes tampoco sustituyen el playtest de UMBRA: sirven para fundamentar qué medir, qué evitar y cómo estructurar el primer balance.


## 10. Primera implementación técnica (15 de octubre de 2026)

Se aplicó una primera pasada conservadora sobre el combate del prototipo:

- La habilidad ya no es gratuita: requiere 20 Ánima, consume 20 y devuelve 4, para un coste neto de 16; inflige ATQ + 12–18 y cura hasta 5 HP. Si falta Ánima, no ejecuta el efecto.
- El ataque normal conserva su generación estable de 12 Ánima.
- La enemiga guarda una intención en el estado de combate del servidor. El estado inicial anuncia ataque rápido; cada tercer turno de combate prepara un golpe cargado. La interfaz presenta una advertencia textual antes de que el jugador elija su respuesta.
- Defender reduce más daño contra el golpe cargado; evadir evita el ataque anunciado; una habilidad con potencia suficiente puede interrumpir el golpe cargado.
- Se añadieron pruebas automáticas para coste de habilidad, intención enemiga, defensa y carga. Deben pasar en CI antes de considerar validada la integración completa.

**Limitaciones actuales:** el patrón aún es compartido y básico, no existe todavía un sistema completo de arquetipos ni una simulación estadística de miles de combates. La intención de guardia está tipada para extensiones, pero no se selecciona todavía como patrón autónomo. La dificultad no debe escalarse hasta verificar build, pruebas, distribución de turnos, resultados y comportamiento de la interfaz. Los números son una primera hipótesis ajustable, no un balance final.
