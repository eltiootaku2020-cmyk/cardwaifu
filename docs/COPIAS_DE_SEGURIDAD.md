# Copias de seguridad de UMBRA

## Crear una copia

En Windows, cierra ninguna aplicación para crear la copia no es necesario: SQLite realiza una copia consistente mientras el servidor local está funcionando.

1. Haz doble clic en `RESPALDAR_UMBRA.bat`.
2. Espera a que indique que la copia se creó correctamente.
3. La copia aparece en `backups/`. El proceso conserva automáticamente las últimas 10 copias creadas por UMBRA; si quieres conservar una más antigua, muévela fuera de esa carpeta.

La herramienta usa la API de copia en línea de SQLite y no reemplaza ni edita la base original. Si aún no existe `data/umbra.sqlite`, inicia UMBRA y crea el progreso antes de intentar respaldar.

## Restaurar una copia

La restauración es manual y debe hacerse con el servidor y el bot cerrados. No es necesario cerrar la aplicación para crear una copia; sí es necesario cerrarla antes de reemplazar la base de datos durante una restauración:

1. Haz una copia adicional del archivo actual `data/umbra.sqlite`, si existe.
2. Selecciona el archivo deseado dentro de `backups/`.
3. Copia ese archivo a la ruta configurada en `DATABASE_PATH` (por defecto `data/umbra.sqlite`) y reemplaza el archivo de destino.
4. Si el servidor estaba abierto al comenzar, asegúrate de que esté completamente cerrado antes de reemplazar la base de datos. Después vuelve a iniciar UMBRA y comprueba el progreso.

No copies o reemplaces la base de datos mientras el servidor la está usando. Mantén una copia adicional fuera del ordenador, ya que un respaldo almacenado en el mismo disco no protege frente al fallo de ese disco.

## Seguridad y límites

- Las copias pueden contener progreso e identificadores de cuenta; no las subas a repositorios públicos ni las compartas.
- El archivo `.env` y el token del bot no forman parte de la copia SQLite.
- El lanzador no crea un token ni despliega la Mini App.
- La prueba de CI compila el código, pero aún se debe probar manualmente la copia con una base de datos real en Windows.
