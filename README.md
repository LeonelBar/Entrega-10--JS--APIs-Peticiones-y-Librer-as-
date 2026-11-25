# 🎮 Simulador de Super-Arcade — Pre-Entrega 10

Simulador interactivo de catálogo y compra de retro juegos de PlayStation 2 desarrollado con HTML5, CSS3 y JavaScript ES6+, conectando una fuente de datos JSON externa mediante `fetch()` y notificaciones visuales con Toastify.

## Novedades de la Pre-Entrega 10

- **Consumo de datos con `fetch()` y `async / await`**: carga inicial del catálogo desde `./data.json` y sincronización con `localStorage`.
- **Manejo de errores con `try / catch / finally`**: muestra el estado de carga mientras resuelve la petición, captura fallos HTTP o de red y oculta el indicador al finalizar.
- **Librería Toastify (vía CDN)**: reemplaza alertas nativas con notificaciones visuales para cargas, compras, altas y errores, manteniendo además el feedback en el DOM.

## Estructura del proyecto

- `index.html`: estructura principal con Toastify (CDN), `css/style.css` y `js/main.js` (`defer`) enlazados en el `<head>`.
- `data.json`: base de datos local en formato JSON con el catálogo inicial de juegos.
- `css/style.css`: estilos dark mode, grilla responsiva y estados visuales.
- `js/main.js`: lógica de `Juego`, peticiones asíncronas, persistencia y manipulación dinámica del DOM.
- `img/`: portadas de los juegos e imagen por defecto.
