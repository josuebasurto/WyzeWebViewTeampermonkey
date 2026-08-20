# Wyze WebPanel Toolkit

Userscript para personalizar la interfaz del WebPanel de Wyze y organizar la vista de cámaras en una cuadrícula configurable.

> Proyecto independiente y no afiliado con Wyze Labs.

## Funciones

- Configuración de columnas y filas de cámaras.
- Separación ajustable entre cámaras, incluyendo `0 px`.
- Corrección de espacios blancos provocados por el layout Masonry del portal.
- Opción para ocultar la navegación y aprovechar más pantalla.
- Panel de configuración minimizable.
- Aviso visual **What's new** al instalar una nueva versión.
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
| Filas | Alto de cada fila; `0` usa el tamaño automático. |
| Separación | Espacio entre cámaras, de 0 a 24 px. |
| Ocultar navegación | Oculta la navegación para maximizar el área de vídeo. |
| Aplicar | Guarda y activa los cambios. |
| Restablecer | Devuelve las opciones a sus valores iniciales. |

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

Selecciona las columnas y filas deseadas y pulsa **Aplicar**. Si el portal acaba de cambiar de vista, recarga la página y vuelve a aplicar la configuración.

### Quiero volver al diseño original

Deshabilita el userscript desde Tampermonkey y recarga el portal.

## Créditos y deslinde

Creado por **Josue Basurto** · [josuebasurto@gmail.com](mailto:josuebasurto@gmail.com)

Este userscript es una herramienta independiente para personalizar la interfaz local del WebPanel de Wyze. No es un producto oficial de Wyze, no está afiliado con Wyze Labs y no modifica la configuración de la cuenta, las cámaras ni los servicios de Wyze. Se proporciona "tal cual" y su uso es responsabilidad exclusiva del usuario. Revisa los permisos, políticas y términos aplicables antes de utilizarlo.
