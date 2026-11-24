// 1) APLICACIÓN DEFINICIÓN DE LA CLASE
class Juego {
    constructor(id, nombre, precio, stock, imagen = "img/portada-default.jpg") {
        this.id = id;
        this.nombre = nombre;
        this.precio = Number(precio);
        this.stock = Number(stock);
        this.imagen = imagen;
    }

    // Método que modifica el estado del objeto (resta stock y valida)
    venderUnidad(cantidadSolicitada) {
        if (this.stock >= cantidadSolicitada) {
            this.stock -= cantidadSolicitada;
            return true;
        }
        return false;
    }

    mostrarInfo() {
        return `${this.nombre} - Precio: $${this.precio} (Stock: ${this.stock})`;
    }
}

// 2) INSTANCIACIÓN Y CATÁLOGO INICIAL
const juego1 = new Juego(1, "GTA San Andreas", 3500, 10, "img/gta-san-andreas.jpg");
const juego2 = new Juego(2, "Resident Evil 4", 3000, 5, "img/re4.jpg");
const juego3 = new Juego(3, "God of War II", 3200, 8, "img/gow2.jpg");
const juego4 = new Juego(4, "Dragon Ball Z Budokai Tenkaichi 3", 3000, 12, "img/bt3.jpg");
const juego5 = new Juego(5, "Gran Turismo 3", 3400, 6, "img/gt3.jpg");

let catalogoSuperArcade = [juego1, juego2, juego3, juego4, juego5];

// 3) SELECCIÓN DE ELEMENTOS DEL DOM
const formJuego = document.querySelector("#form-juego");
const inputNombre = document.getElementById("input-nombre");
const inputPrecio = document.getElementById("input-precio");
const inputStock = document.getElementById("input-stock");
const inputBuscar = document.querySelector("#input-buscar");
const contenedor = document.querySelector("#contenedor");
const feedbackVisual = document.getElementById("feedback-visual");

// 4) FEEDBACK VISUAL EN PANTALLA (sin alert ni console.log)
function mostrarFeedback(mensaje, esAlerta = false) {
    feedbackVisual.textContent = mensaje;
    feedbackVisual.classList.toggle("alerta", esAlerta);
}

// 5) RENDERIZADO DINÁMICO CON innerHTML Y TEMPLATE LITERALS
function renderizarCatalogo(listaJuegos) {
    if (listaJuegos.length === 0) {
        contenedor.innerHTML = `<p>No se encontraron juegos con ese criterio.</p>`;
        return;
    }

    contenedor.innerHTML = listaJuegos
        .map(
            (juego) => `
            <article class="tarjeta-juego ${juego.stock === 0 ? "sin-stock" : ""}" data-id="${juego.id}">
                <img src="${juego.imagen}" alt="Portada de ${juego.nombre}" class="portada-juego" />
                <h3>${juego.nombre}</h3>
                <p>Precio: $${juego.precio}</p>
                <p>Stock: ${juego.stock}</p>
                <button type="button" class="btn btn-comprar" data-id="${juego.id}">Comprar</button>
                <button type="button" class="btn-eliminar" data-id="${juego.id}">Eliminar</button>
            </article>
        `
        )
        .join("");

    asociarEventosTarjetas();
}

// 6) EVENTOS DE CADA TARJETA (Comprar / Eliminar)
function asociarEventosTarjetas() {
    const botonesComprar = contenedor.querySelectorAll(".btn-comprar");
    botonesComprar.forEach((boton) => {
        boton.addEventListener("click", () => {
            const idSeleccionado = Number(boton.dataset.id);
            const juegoEncontrado = catalogoSuperArcade.find((j) => j.id === idSeleccionado);

            if (juegoEncontrado && juegoEncontrado.venderUnidad(1)) {
                actualizarVistaActual();
                mostrarFeedback(
                    `Venta realizada: "${juegoEncontrado.nombre}". Stock restante: ${juegoEncontrado.stock}.`
                );
            } else if (juegoEncontrado) {
                mostrarFeedback(`Sin stock disponible para "${juegoEncontrado.nombre}".`, true);
            }
        });
    });

    const botonesEliminar = contenedor.querySelectorAll(".btn-eliminar");
    botonesEliminar.forEach((boton) => {
        boton.addEventListener("click", () => {
            const idEliminar = Number(boton.dataset.id);
            const juegoObjetivo = catalogoSuperArcade.find((j) => j.id === idEliminar);

            catalogoSuperArcade = catalogoSuperArcade.filter((j) => j.id !== idEliminar);
            actualizarVistaActual();

            if (juegoObjetivo) {
                mostrarFeedback(`Se eliminó "${juegoObjetivo.nombre}" del catálogo.`);
            }
        });
    });
}

// 7) ACTUALIZAR VISTA RESPETANDO EL FILTRO ACTIVO
function actualizarVistaActual() {
    const termino = inputBuscar.value.trim().toLowerCase();
    const listaFiltrada = catalogoSuperArcade.filter((juego) =>
        juego.nombre.toLowerCase().includes(termino)
    );
    renderizarCatalogo(listaFiltrada);
}

// 8) EVENTO SUBMIT / CLICK PARA AGREGAR UN NUEVO JUEGO SIN RECARGAR
formJuego.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nombreLimpio = inputNombre.value.trim();
    const precioNum = Number(inputPrecio.value);
    const stockNum = Number(inputStock.value);

    if (!nombreLimpio || precioNum <= 0) {
        mostrarFeedback("Ingresá un nombre válido y un precio mayor a 0.", true);
        return;
    }

    const nuevoId =
        catalogoSuperArcade.length > 0
            ? Math.max(...catalogoSuperArcade.map((j) => j.id)) + 1
            : 1;

    const nuevoJuego = new Juego(nuevoId, nombreLimpio, precioNum, stockNum);
    catalogoSuperArcade.push(nuevoJuego);

    inputBuscar.value = "";
    renderizarCatalogo(catalogoSuperArcade);
    mostrarFeedback(`Se agregó "${nuevoJuego.nombre}" ($${nuevoJuego.precio}) al catálogo.`);

    formJuego.reset();
    inputStock.value = "5";
    inputNombre.focus();
});

// 9) EVENTO DE TECLADO PARA FILTRAR EN TIEMPO REAL
inputBuscar.addEventListener("keyup", () => {
    const termino = inputBuscar.value.trim().toLowerCase();
    const filtrados = catalogoSuperArcade.filter((juego) =>
        juego.nombre.toLowerCase().includes(termino)
    );

    renderizarCatalogo(filtrados);
    mostrarFeedback(
        termino
            ? `Filtrando por "${inputBuscar.value.trim()}": ${filtrados.length} juego(s).`
            : `Mostrando todo el catálogo (${catalogoSuperArcade.length} juegos).`
    );
});

// Render inicial al cargar la página
renderizarCatalogo(catalogoSuperArcade);