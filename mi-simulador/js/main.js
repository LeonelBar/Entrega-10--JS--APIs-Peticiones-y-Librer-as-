const CLAVE_STORAGE_CATALOGO = "superArcade_catalogo_pe10";
const RUTA_CATALOGO_JSON = "./data.json";
const COTIZACION_REFERENCIA_ARS = 1450;

// 1) DEFINICIÓN DE LA CLASE
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

let catalogoSuperArcade = [];

// 2) SELECCIÓN DE ELEMENTOS DEL DOM
const formJuego = document.querySelector("#form-juego");
const inputNombre = document.getElementById("input-nombre");
const inputPrecio = document.getElementById("input-precio");
const inputStock = document.getElementById("input-stock");
const inputBuscar = document.querySelector("#input-buscar");
const contenedor = document.querySelector("#contenedor");
const estadoCarga = document.getElementById("estado-carga");
const feedbackVisual = document.getElementById("feedback-visual");
const avisoComplementario = document.getElementById("aviso-complementario");

// 3) NOTIFICACIONES CON TOASTIFY + FEEDBACK EN EL DOM (sin alert, prompt ni console)
function notificarToast(texto, tipo = "info") {
    const colores = {
        exito: "linear-gradient(135deg, #059669, #10b981)",
        error: "linear-gradient(135deg, #be123c, #f43f5e)",
        info: "linear-gradient(135deg, #1d4ed8, #0284c7)"
    };

    if (typeof Toastify === "function") {
        Toastify({
            text: texto,
            duration: 3000,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: colores[tipo] ?? colores.info,
                borderRadius: "8px",
                fontWeight: "bold"
            }
        }).showToast();
    }
}

function mostrarFeedback(mensaje, esAlerta = false, tipoToast = null) {
    feedbackVisual?.classList.toggle("alerta", esAlerta);
    if (feedbackVisual) {
        feedbackVisual.textContent = mensaje ?? "Acción completada.";
    }

    const tipoFinal = tipoToast ?? (esAlerta ? "error" : "info");
    if (mensaje) {
        notificarToast(mensaje, tipoFinal);
    }
}

function setEstadoCarga(texto) {
    if (estadoCarga) {
        estadoCarga.textContent = texto ?? "";
    }
}

function mostrarAvisoComplementario(mensaje) {
    const destino = avisoComplementario ?? feedbackVisual;
    if (destino) {
        destino.textContent = mensaje;
    }
}

// 4) PERSISTENCIA EN LOCALSTORAGE + REHIDRATACIÓN
function guardarEnStorage(lista) {
    localStorage.setItem(CLAVE_STORAGE_CATALOGO, JSON.stringify(lista));
}

function rehidratarCatalogo(datos) {
    const listaSegura = Array.isArray(datos) ? datos : [];

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

// 5) PETICIÓN CON FETCH() A ./data.json + ASYNC / AWAIT + TRY / CATCH / FINALLY
async function obtenerCatalogoDesdeJson(ruta = RUTA_CATALOGO_JSON) {
    const respuesta = await fetch(ruta);
    if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status} al leer ${ruta}`);
    }

    const datos = await respuesta.json();
    if (!Array.isArray(datos)) {
        throw new Error("El formato del JSON no corresponde a un listado de juegos.");
    }

    return rehidratarCatalogo(datos);
}

async function inicializarCatalogo() {
    setEstadoCarga("Cargando productos…");
    mostrarFeedback("Cargando productos desde ./data.json...", false, "info");

    try {
        const guardadoLocal = localStorage.getItem(CLAVE_STORAGE_CATALOGO);

        if (guardadoLocal) {
            const parseado = JSON.parse(guardadoLocal);
            catalogoSuperArcade = rehidratarCatalogo(parseado);
        } else {
            catalogoSuperArcade = await obtenerCatalogoDesdeJson(RUTA_CATALOGO_JSON);
            guardarEnStorage(catalogoSuperArcade);
        }

        actualizarVistaActual();
        mostrarFeedback("Productos cargados con éxito", false, "exito");
    } catch (error) {
        mostrarFeedback(
            `No se pudieron cargar los productos (${error?.message ?? "error de red"}).`,
            true,
            "error"
        );
    } finally {
        setEstadoCarga("");
    }
}

// 6) RENDERIZADO DINÁMICO CON DESTRUCTURING Y OPERADOR TERNARIO
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

// 7) EVENTOS DE CADA TARJETA (Comprar / Eliminar) + PERSISTENCIA
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
                    `Compra confirmada: "${juegoEncontrado.nombre}" (stock restante: ${juegoEncontrado.stock}).`,
                    false,
                    "exito"
                );
            } else if (juegoEncontrado) {
                mostrarFeedback(
                    `Sin stock disponible para "${juegoEncontrado.nombre}".`,
                    true,
                    "error"
                );
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
                    `Se eliminó "${juegoObjetivo.nombre}" del catálogo.`,
                    false,
                    "info"
                );
            }
        });
    });
}

// 8) ACTUALIZAR VISTA RESPETANDO EL FILTRO ACTIVO
function actualizarVistaActual() {
    const termino = (inputBuscar?.value ?? "").trim().toLowerCase();
    const listaFiltrada = catalogoSuperArcade.filter(({ nombre }) =>
        nombre.toLowerCase().includes(termino)
    );
    renderizarCatalogo(listaFiltrada);
}

// 9) EVENTO SUBMIT CON TRY / CATCH / FINALLY + PERSISTENCIA
formJuego?.addEventListener("submit", (evento) => {
    evento.preventDefault();

    try {
        const nombreLimpio = (inputNombre?.value ?? "").trim();
        const precioNum = Number(inputPrecio?.value ?? 0);
        const stockNum = Number(inputStock?.value ?? 0);

        if (!nombreLimpio || Number.isNaN(precioNum) || precioNum <= 0) {
            throw new Error("Ingresá un nombre válido y un precio mayor a 0.");
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
            `Se agregó "${nuevoJuego.nombre}" ($${nuevoJuego.precio}) al catálogo.`,
            false,
            "exito"
        );
    } catch (error) {
        mostrarFeedback(
            `No se pudo completar la acción (${error?.message ?? "intentá de nuevo"}).`,
            true,
            "error"
        );
    } finally {
        formJuego.reset();
        if (inputStock) {
            inputStock.value = "5";
        }
        inputNombre?.focus();
    }
});

// 10) EVENTO DE TECLADO PARA FILTRAR EN TIEMPO REAL
inputBuscar?.addEventListener("keyup", () => {
    const termino = (inputBuscar?.value ?? "").trim().toLowerCase();
    const filtrados = catalogoSuperArcade.filter(({ nombre }) =>
        nombre.toLowerCase().includes(termino)
    );

    renderizarCatalogo(filtrados);
    if (feedbackVisual) {
        feedbackVisual.classList.remove("alerta");
        feedbackVisual.textContent = termino
            ? `Filtrando por "${(inputBuscar?.value ?? "").trim()}": ${filtrados.length} juego(s).`
            : `Mostrando todo el catálogo (${catalogoSuperArcade.length} juegos).`;
    }
});

// 11) TEMPORIZADOR AL INGRESAR + CARGA INICIAL CON FETCH
setTimeout(() => {
    mostrarAvisoComplementario(
        `🔔 Cotización de referencia hoy: $${COTIZACION_REFERENCIA_ARS} ARS — ¡Catálogo PS2 listo!`
    );
}, 2500);

inicializarCatalogo();