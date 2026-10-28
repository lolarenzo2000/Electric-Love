# Electric-Love

Visualización interactiva de partículas hecha con Three.js. Abre `index.html` en
un navegador con conexión a internet para cargar la librería de Three.js.

## Archivos

- `index.html`: estructura de la página y carga de los recursos.
- `styles.css`: colores, distribución del panel y estilos de los controles.
- `app.js`: interfaz, partículas, animación, interacciones y efectos.
- `assets/music.mp3`: pista que se carga automáticamente como recurso del sitio.

## Música

Puedes elegir un archivo desde el panel para escucharlo durante la sesión. Para
que la música esté disponible al publicar el proyecto, coloca una pista MP3 en
`assets/music.mp3` antes del deploy. El archivo debe formar parte del repositorio
o de los archivos que publiques; la selección local del panel no se sube al
servidor. Pulsa reproducir en el control de audio, ya que el navegador no permite
iniciar música automáticamente sin una interacción del usuario.

## Cómo leer el código

En `app.js`, empieza por `P` para ver los valores iniciales y por `SCENES` para
las configuraciones de ejemplo. `UI` define los controles del panel. Más abajo,
`tick()` ejecuta cada fotograma: calcula las fuerzas de las partículas, actualiza
sus posiciones y dibuja la escena. La sección de micelio gestiona las puntas que
crecen y los segmentos que forman la red.

Los comentarios del código explican los algoritmos y los datos que necesitan
contexto. En el panel puedes elegir una escena con las teclas `1` a `8`, pulsar
`Espacio` para el pulso, usar `B` para disparar un rayo y `H` para ocultar el panel.
