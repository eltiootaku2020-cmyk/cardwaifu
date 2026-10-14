# UMBRA: Card Frontier — CEREBRO Y OBRERO

Documento maestro de continuidad. Contiene la visión, lore, sistemas, reglas y decisiones pendientes del juego. La versión completa se irá consolidando aquí.

## Visión
RPG anime de cartas coleccionables, primero como Telegram Mini App, con exploración por capítulos, invocación, combate por turnos, progresión y eventos comunitarios. Inspiraciones de género: Fate/Grand Order, DanMachi, Honkai: Star Rail y WIXOSS; personajes, mundo, textos y arte deben ser originales.

## Protagonista y cámara
Al inicio se elige protagonista hombre o mujer. La cámara siempre lo/la muestra desde atrás; jamás se ve su rostro. La primera invocación es aleatoria dentro de un grupo inicial pequeño. La heroína está consciente, habla y establece vínculo con el protagonista.

## Heroínas, formas y clases
Formas exactas: Lily → Hero → Epic. No hay forma posterior a Epic. Lily no tiene Dark; Hero y Epic pueden tener Dark si el personaje lo permite. Son etapas de una misma identidad. Las clases son un eje distinto: Espadachina, Lancera, Arquera, Jinete y Hechicera. Fuera de combate, la heroína vuelve a Lily; su forma verdadera se ve en combate, inventario o ficha. Solo se permite una evolución por batalla. Rareza y manifestación dependen de la versión, no de la fama histórica automáticamente.

## Rarezas y colección
Rarezas R, S, SR, SSR y UR. La invocación es importante, pero la mayoría de personajes deben poder conseguirse jugando. Las limitadas pueden volver en eventos o conseguirse a largo plazo. Ante duplicados, elegir entre mejorar la unidad o recibir materiales. El Ánima común no se usa en gacha. El Ánima premium puede gastarse en progreso o gacha y obtenerse mediante pago y pequeñas cantidades de historia/eventos; mostrar advertencia antes de gastarla en algo obtenible jugando.

## Combate y recursos
Combate por turnos: duelos 1v1, heroína contra varios enemigos o equipo contra grupo/jefe según misión. Acciones base: atacar, habilidad, defender, evadir, cargar y definitiva. El Ánima se acumula durante el combate. Al alcanzar el umbral, se puede evolucionar gastando Alma del protagonista, como máximo una vez por batalla.

Alma pertenece al jugador; Ánima se gana jugando y durante combate. Valores tentativos, no definitivos: Alma máxima 100, regeneración +4/h, recarga diaria +20, evolución 25, cacería 10, curación 10. A 0 Alma se pueden esperar encuentros gratuitos, pero no iniciar cacerías con coste ni evolucionar. La historia principal nunca se bloquea por falta de Alma. Separar Ánima común y premium.

## Dark y redención
Algunas heroínas se descarriaron o no llegaron a sus descendientes y contaminaron el suelo; cazan personas y héroes para obtener Alma o Ánima. No son malvadas por naturaleza: tienen motivaciones e historias y pueden redimirse/reclutarse. Monstruos y perros contaminados son enemigos comunes.

## Equipamiento
Preparación antes del combate con cuatro slots: 1 arma, 2 equipamientos y 1 apoyo tipo objeto. Rarezas R/S/SR/SSR/UR; bonificaciones universales y de afinidad. Se mejora con materiales, no Alma.

## Heroínas de apoyo y Corazones Heroicos
Heroínas de apoyo: personajes invocables que ocupan dos espacios y aportan habilidades/ataques sin cinemáticas propias completas. Corazones Heroicos: cartas de objetos, recuerdos o escenas con ilustración, estadísticas, pasivas y sinergias. Ejemplos orientativos: Granjera de Bretaña R «Frutos sobrantes» cura 1–5% al inicio de turno; apoyo Hércules «Fuerza sobrehumana» +1–5% ATQ durante turno; Corazón «Los 10 trabajos» da +10% ATQ con Hércules y revive una vez por batalla con 80% de vida máxima. Si vuelve a morir, no revive de nuevo. Cifras pendientes de balance.

## Niveles y Ruptura de Límite
Nivel máximo 100. XP hasta el límite; materiales para rupturas 10→11, 20→21…90→91. Materiales discutidos: Polvo, Extracto, Jugo, Gema y Corazón de Ánima, más avanzados. Cada ruptura otorga bonus permanente de atributos y mejora pequeña de combate. Animación base común personalizada por heroína/rareza; técnicas nuevas solo en hitos especiales. No cuesta Alma, no cambia forma y no reemplaza el equipamiento.

## Mundo, modos y comunidad
Capítulos, cacerías, jefes, eventos y misiones. PvP y cooperación contra jefes a futuro. Drops comunitarios con acceso para administrador, miembros autorizados o abierto; permisos siempre validados en servidor. Las maquetas no significan que Telegram o Discord estén integrados.

## Arquitectura preferida
Mini App TypeScript/Vite, API Express, bot grammY y SQLite inicial. Mantener reglas de combate, recursos, inventario y permisos en servidor. Validar Telegram WebApp initData con HMAC en servidor; no confiar en initDataUnsafe. Secretos en .env. Godot no es necesario para el MVP de cartas por turnos.

## Pendiente
Fórmula de daño, estados, economía definitiva, probabilidades/pity, recetas de ruptura, equipo/slots, catálogo inicial de personajes, capítulos y jefes, despliegue, moderación y privacidad.

## Regla de continuidad
Este documento es la fuente de verdad del proyecto. Las cifras marcadas como tentativas no son reglas finales. Actualizarlo cuando se aprueben cambios y nunca afirmar que una integración está terminada sin probarla.