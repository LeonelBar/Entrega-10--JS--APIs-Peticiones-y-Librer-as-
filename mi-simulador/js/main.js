const CLAVE_STORAGE_CATALOGO = "superArcade_catalogo_pe8";

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

const catalogoInicial = [juego1, juego2, juego3, juego4, juego5];

function guardarEnStorage(lista) {
    localStorage.setItem(CLAVE_STORAGE_CATALOGO, JSON.stringify(lista));
}

function cargarDesdeStorage() {
    const guardado = localStorage.getItem(CLAVE_STORAGE_CATALOGO);
    if (!guardado) {
        const copiaInicial = [...catalogoInicial];
        guardarEnStorage(copiaInicial);
        return copiaInicial;
    }

    const datosParseados = JSON.parse(guardado);
    const listaSegura = Array.isArray(datosParseados) ? datosParseados : catalogoInicial;

    // Rehidratamos cada objeto plano como instancia de Juego con destructuring y ??
    return listaSegura.map((item) => {
        const { id, nombre, precio, stock, imagen } = item ?? {};
        return new Juego(
            id,
            nombre ?? "Sin título",
            precio ?? 0,
            stock ?? 0,
            imagen ?? "img/portada-default.jpg"
        );
    });
}

let catalogoSuperArcade = cargarDesdeStorage();

// 3) SELECCIÓN DE ELEMENTOS DEL DOM
const formJuego = document.querySelector("#form-juego");
const inputNombre = document.getElementById("input-nombre");
const inputPrecio = document.getElementById("input-precio");
const inputStock = document.getElementById("input-stock");
const inputBuscar = document.querySelector("#input-buscar");
const contenedor = document.querySelector("#contenedor");
const feedbackVisual = document.getElementById("feedback-visual");

// 4) FEEDBACK VISUAL EN PANTALLA (sin el alert ni console.log) con ?. y ??
function mostrarFeedback(mensaje, esAlerta = false) {
    feedbackVisual?.classList.toggle("alerta", esAlerta);
    if (feedbackVisual) {
        feedbackVisual.textContent = mensaje ?? "Acción completada.";
    }
}

// 5) RENDERIZADO DINÁMICO CON DESTRUCTURING Y OPERADOR TERNARIO
function renderizarCatalogo(listaJuegos) {
    if (!contenedor) return;

    if (listaJuegos.length === 0) {
        contenedor.innerHTML = `<p>No se encontraron juegos con ese criterio.</p>`;
        return;
    }

    contenedor.innerHTML = listaJuegos
        .map(({ id, nombre, precio, stock, imagen }) => {
            const claseStock = stock === 0 ? "sin-stock" : "";
            const etiquetaStock = stock > 0 ? `Stock: ${stock}` : "Sin stock";
            const portada = imagen ?? "img/portada-default.jpg";

            return `
            <article class="tarjeta-juego ${claseStock}" data-id="${id}">
                <img
                    src="${portada}"
                    alt="Portada de ${nombre}"
                    class="portada-juego"
                    onerror="this.onerror=null; this.src='img/portada-default.jpg';"
                />
                <h3>${nombre}</h3>
                <p>Precio: $${precio}</p>
                <p>${etiquetaStock}</p>
                <button type="button" class="btn btn-comprar" data-id="${id}">Comprar</button>
                <button type="button" class="btn-eliminar" data-id="${id}">Eliminar</button>
            </article>
        `;
        })
        .join("");

    asociarEventosTarjetas();
}

// 6) EVENTOS DE CADA TARJETA (Comprar / Eliminar) + PERSISTENCIA
function asociarEventosTarjetas() {
    const botonesComprar = contenedor.querySelectorAll(".btn-comprar");
    botonesComprar.forEach((boton) => {
        boton.addEventListener("click", () => {
            const idSeleccionado = Number(boton.dataset.id);
            const juegoEncontrado = catalogoSuperArcade.find(({ id }) => id === idSeleccionado);

            if (juegoEncontrado?.venderUnidad(1)) {
                guardarEnStorage(catalogoSuperArcade);
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
            const juegoObjetivo = catalogoSuperArcade.find(({ id }) => id === idEliminar);

            catalogoSuperArcade = catalogoSuperArcade.filter(({ id }) => id !== idEliminar);
            guardarEnStorage(catalogoSuperArcade);
            actualizarVistaActual();

            if (juegoObjetivo) {
                mostrarFeedback(
                    `Se eliminó "${juegoObjetivo.nombre}" del catálogo y del localStorage.`
                );
            }
        });
    });
}

// 7) ACTUALIZAR VISTA RESPETANDO EL FILTRO ACTIVO
function actualizarVistaActual() {
    const termino = (inputBuscar?.value ?? "").trim().toLowerCase();
    const listaFiltrada = catalogoSuperArcade.filter(({ nombre }) =>
        nombre.toLowerCase().includes(termino)
    );
    renderizarCatalogo(listaFiltrada);
}

// 8) EVENTO SUBMIT / CLICK PARA AGREGAR UN NUEVO JUEGO SIN RECARGAR + PERSISTENCIA
formJuego?.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nombreLimpio = (inputNombre?.value ?? "").trim();
    const precioNum = Number(inputPrecio?.value ?? 0);
    const stockNum = Number(inputStock?.value ?? 0);

    if (!nombreLimpio || precioNum <= 0) {
        mostrarFeedback("Ingresá un nombre válido y un precio mayor a 0.", true);
        return;
    }

    const nuevoId =
        catalogoSuperArcade.length > 0
            ? Math.max(...catalogoSuperArcade.map(({ id }) => id)) + 1
            : 1;

    const nuevoJuego = new Juego(nuevoId, nombreLimpio, precioNum, stockNum);
    catalogoSuperArcade = [...catalogoSuperArcade, nuevoJuego];
    guardarEnStorage(catalogoSuperArcade);

    if (inputBuscar) {
        inputBuscar.value = "";
    }
    renderizarCatalogo(catalogoSuperArcade);
    mostrarFeedback(
        `Se agregó "${nuevoJuego.nombre}" ($${nuevoJuego.precio}) y quedó guardado en localStorage.`
    );

    formJuego.reset();
    if (inputStock) {
        inputStock.value = "5";
    }
    inputNombre?.focus();
});

// 9) EVENTO DE TECLADO PARA FILTRAR EN TIEMPO REAL
inputBuscar?.addEventListener("keyup", () => {
    const termino = (inputBuscar?.value ?? "").trim().toLowerCase();
    const filtrados = catalogoSuperArcade.filter(({ nombre }) =>
        nombre.toLowerCase().includes(termino)
    );

    renderizarCatalogo(filtrados);
    mostrarFeedback(
        termino
            ? `Filtrando por "${(inputBuscar?.value ?? "").trim()}": ${filtrados.length} juego(s).`
            : `Mostrando todo el catálogo (${catalogoSuperArcade.length} juegos).`
    );
});

// Render inicial al cargar o recargar la página (F5)
renderizarCatalogo(catalogoSuperArcade);