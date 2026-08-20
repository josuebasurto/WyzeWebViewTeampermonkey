# Wyze WebPanel Toolkit

Userscript para personalizar la interfaz del WebPanel de Wyze y organizar la vista de cámaras en una cuadrícula configurable.

> Proyecto independiente y no afiliado con Wyze Labs.

## Funciones

- Configuración de columnas de cámaras con controles `-` y `+`.
- Separación ajustable entre cámaras, con `1 px` como valor inicial.
- Corrección de espacios blancos provocados por el layout Masonry del portal.
- Opción para ocultar la navegación y aprovechar más pantalla.
- Panel de configuración minimizable.
- Aviso visual **What's new** al instalar una nueva versión y botón para volver a abrirlo.
- Cambios aplicados inmediatamente, sin botón Aplicar.
- Reintento opcional para cámaras offline con espera incremental hasta cada 5 minutos.
- Indicador amarillo dentro de cada cámara mientras el reintento automático está activo.
- Fullscreen directo por cámara, independiente del layout de Masonry.
- Opción para mantener la pantalla activa mientras el portal está visible.
- Configuración persistente mediante `localStorage`.
- Detección automática de cambios en la interfaz React del portal.

## Instalación

1. Instala [Tampermonkey](https://www.tampermonkey.net/) en tu navegador.
2. Abre [`teampermonkey01.js`](teampermonkey01.js).
3. Copia el contenido y crea un nuevo userscript en Tampermonkey.
4. Guarda el script y asegúrate de que esté habilitado.
5. Abre [`my.wyze.com/home`](https://my.wyze.com/home).
6. Recarga la página con `Ctrl + F5`.

El panel **Wyze Grid** aparecerá minimizado en la esquina inferior derecha.

## Configuración

| Opción | Descripción |
| --- | --- |
| Columnas | Número de cámaras por fila, de 1 a 8. |
| Separación | Espacio entre cámaras, de 0 a 24 px; inicia en 1 px. |
| Ocultar navegación | Oculta la navegación para maximizar el área de vídeo. |
| What's new | Vuelve a abrir el modal de novedades. |
| Restablecer | Devuelve las opciones a sus valores iniciales. |
| Reintentar offline | Activa reintentos automáticos para tarjetas con estado offline. |
| Mantener pantalla activa | Solicita Screen Wake Lock para evitar el reposo normal de la pantalla. |

Los cambios se guardan y aplican automáticamente al modificar un control.

Cuando está activo, el reintento usa esta secuencia por cámara: `5 s`, `15 s`, `30 s`, `1 min`, `2 min` y después `5 min` entre intentos. El checkbox está desactivado por defecto.

La opción de pantalla activa requiere un navegador compatible y una página segura (`https`). El sistema operativo o las políticas corporativas pueden ignorarla.

La configuración se almacena localmente en el navegador con la clave `wyze-grid-enhancer-settings`.

## Archivos

```text
WyzeWebKit/
├── README.md
├── readme.html
├── teampermonkey01.js
└── WebPage/
    ├── Wyze Web Portal.html
    ├── Wyze Web Portal 2.html
    └── Wyze Web Portal 3.html
```

- [`teampermonkey01.js`](teampermonkey01.js): userscript principal.
- [`readme.html`](readme.html): documentación visual autónoma.
- [`WebPage/`](WebPage/): capturas HTML de referencia del portal. Sus carpetas de recursos descargados están excluidas mediante `.gitignore`.

## Solución de problemas

### El panel no aparece

Comprueba que Tampermonkey esté habilitado para `my.wyze.com`, que el script esté activo y recarga con `Ctrl + F5`.

### Las cámaras mantienen espacios blancos

Si el portal acaba de cambiar de vista, recarga la página. Los cambios se aplican automáticamente.

### Quiero volver al diseño original

Deshabilita el userscript desde Tampermonkey y recarga el portal.

## Créditos y deslinde

Creado por **Josue Basurto**

Este userscript es una herramienta independiente para personalizar la interfaz local del WebPanel de Wyze. No es un producto oficial de Wyze, no está afiliado con Wyze Labs y no modifica la configuración de la cuenta, las cámaras ni los servicios de Wyze. Se proporciona "tal cual" y su uso es responsabilidad exclusiva del usuario. Revisa los permisos, políticas y términos aplicables antes de utilizarlo.
