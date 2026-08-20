# Contexto para futuras sesiones de IA

## Proyecto

`WyzeWebKit` es un proyecto local para personalizar la interfaz web de Wyze mediante un userscript de Tampermonkey. El objetivo es mejorar la visualizacion de varias camaras en `https://my.wyze.com/home`, sin modificar la cuenta ni los dispositivos.

Autor y contacto: **Josue Basurto** · `josuebasurto@gmail.com`

## Archivos principales

- `teampermonkey01.js`: userscript principal. Es el archivo operativo que se copia a Tampermonkey.
- `README.md`: documentacion principal para GitHub.
- `readme.html`: documentacion visual autonoma para abrir en un navegador.
- `WebPage/`: capturas HTML del portal usadas como referencia. Las carpetas `WebPage/*_files/` estan ignoradas por Git porque contienen recursos descargados.
- `.gitignore`: ignora las carpetas de recursos descargados de las capturas.

## Funcionalidad actual

El userscript:

- Detecta la cuadrilla de camaras generada dinamicamente por React.
- Prioriza el contenedor `.MuiMasonry-root` cuando contiene varias camaras.
- Sustituye el layout Masonry por CSS Grid.
- Permite elegir de 1 a 8 columnas mediante un control `- / valor / +`.
- Permite configurar filas, separacion entre camaras y ocultar navegacion.
- Guarda opciones en `localStorage` con la clave `wyze-grid-enhancer-settings`.
- Inicia el panel minimizado.
- Muestra un modal `What's new` una vez por version usando `wyze-grid-enhancer-whats-new`.
- Incluye creditos, correo y deslinde de responsabilidades.

Valores predeterminados actuales: `columns: 2`, `rows: 0`, `gap: 0`, `hideChrome: false`.

## Como validar cambios

Desde la raiz del proyecto:

```powershell
node --check teampermonkey01.js
```

Tambien revisar errores del archivo en VS Code y probar manualmente en el portal:

1. Actualizar el userscript en Tampermonkey.
2. Recargar `my.wyze.com/home` con `Ctrl + F5`.
3. Abrir el panel minimizado.
4. Probar columnas, filas, separacion y ocultar navegacion.
5. Confirmar que no aparecen espacios blancos entre las tarjetas.

## Decisiones importantes

- El DOM de Wyze se genera con React y usa clases CSS generadas. No asumir que una clase `css-...` sera estable.
- `MuiMasonry-root` fue encontrado en las capturas y es el mejor ancla conocida, pero debe verificarse si Wyze cambia su frontend.
- La deteccion generica de ancestros se conserva como fallback si desaparece `.MuiMasonry-root`.
- El `MutationObserver` es necesario porque las camaras y sus videos aparecen o se reconstruyen despues de la carga inicial.
- Mantener `@grant none` salvo que se necesite una capacidad concreta de Tampermonkey.
- Conservar el deslinde: el script es independiente, no afiliado con Wyze y se entrega tal cual.

## Problemas conocidos y errores anteriores

1. **Primer intento de layout:** se detectaba un ancestro generico de los videos y se aplicaba Grid demasiado arriba o demasiado abajo. Resultado: tarjetas pequeñas y espacios blancos.
2. **Masonry conservando estilos:** aunque se forzaba `display: grid`, Masonry mantenia `order`, `transform`, anchos y posicionamiento. Se añadieron reglas para resetear esas propiedades y se priorizo `.MuiMasonry-root`.
3. **Limitacion actual:** no se ha automatizado una prueba dentro de Tampermonkey ni se ha usado una pestaña compartida del navegador. La validacion realizada es estatica (`node --check` y diagnostico de VS Code); la prueba visual final debe hacerse en el portal real.
4. **Capturas guardadas:** los HTML de `WebPage/` pueden quedar incompletos sin sus carpetas `_files/`; esas carpetas estan ignoradas intencionalmente, por lo que no deben usarse como instalacion del portal.

## Que hacer

- Mantener los cambios enfocados en la interfaz local de la cuadrilla y sus controles.
- Leer primero `teampermonkey01.js` antes de editarlo.
- Validar siempre con `node --check teampermonkey01.js`.
- Probar con varias cantidades de camaras y columnas, especialmente 1, 2, 3, 4 y 8.
- Actualizar `README.md` si cambia la instalacion o la configuracion.
- Incrementar `VERSION` y `@version` cuando se agregue una novedad que deba anunciarse.
- Mantener ASCII en comentarios y strings del script cuando no sea necesario usar caracteres especiales.

## Que no hacer

- No modificar credenciales, solicitudes de red, streams, permisos o datos de la cuenta.
- No afirmar que el script es oficial de Wyze ni eliminar el deslinde.
- No depender de una clase hash `css-...` sin un fallback o una verificacion en una captura nueva.
- No ignorar cambios del usuario ni revertir archivos no relacionados.
- No agregar frameworks o dependencias para una modificacion que puede resolverse con CSS y JavaScript nativo.
- No committear cambios automaticamente salvo que el usuario lo pida expresamente.