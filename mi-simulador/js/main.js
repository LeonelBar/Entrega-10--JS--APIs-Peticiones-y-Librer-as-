const CLAVE_STORAGE_CATALOGO = "superArcade_catalogo_pe9";
const COTIZACION_REFERENCIA_ARS = 1450;

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

function rehidratarCatalogo(datosParseados) {
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

function cargarDesdeStorage() {
    const guardado = localStorage.getItem(CLAVE_STORAGE_CATALOGO);
    if (!guardado) {
        const copiaInicial = [...catalogoInicial];
        guardarEnStorage(copiaInicial);
        return copiaInicial;
    }

    return rehidratarCatalogo(JSON.parse(guardado));
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
const avisoComplementario = document.getElementById("aviso-complementario");

// 4) FEEDBACK VISUAL EN PANTALLA (sin alert ni console.log) con ?. y ??
function mostrarFeedback(mensaje, esAlerta = false) {
    feedbackVisual?.classList.toggle("alerta", esAlerta);
    if (feedbackVisual) {
        feedbackVisual.textContent = mensaje ?? "Acción completada.";
    }
}

function mostrarAvisoComplementario(mensaje) {
    const destino = avisoComplementario ?? feedbackVisual;
    if (destino) {
        destino.textContent = mensaje;
    }
}

// 5) PROMESA ASÍNCRONA DE CARGA DE CATÁLOGO CON SETTIMEOUT
function obtenerCatalogoAsync(forzarError = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (forzarError) {
                reject(new Error("No se pudo sincronizar el catálogo del simulador."));
                return;
            }

            const guardado = localStorage.getItem(CLAVE_STORAGE_CATALOGO);
            if (!guardado) {
                const copiaInicial = [...catalogoInicial];
                guardarEnStorage(copiaInicial);
                resolve(copiaInicial);
                return;
            }

            resolve(rehidratarCatalogo(JSON.parse(guardado)));
        }, 900);
    });
}

// 6) CONSUMO CON ASYNC / AWAIT + TRY / CATCH / FINALLY
async function cargarCatalogoAsync(forzarError = false) {
    let estadoCargaCerrado = false;
    mostrarFeedback("⏳ Cargando productos del catálogo...");

    try {
        const juegosObtenidos = await obtenerCatalogoAsync(forzarError);
        catalogoSuperArcade = juegosObtenidos;
        actualizarVistaActual();
        mostrarFeedback(`✔️ ${catalogoSuperArcade.length} productos cargados.`);
    } catch (error) {
        mostrarFeedback(
            `⚠️ No se pudo procesar la operación (${error?.message ?? "error inesperado"}), intentá de nuevo.`,
            true
        );
    } finally {
        estadoCargaCerrado = true;
        if (estadoCargaCerrado && contenedor && contenedor.children.length === 0) {
            renderizarCatalogo(catalogoSuperArcade);
        }
    }
}

// 7) RENDERIZADO DINÁMICO CON DESTRUCTURING Y OPERADOR TERNARIO
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

// 8) EVENTOS DE CADA TARJETA (Comprar / Eliminar) + PERSISTENCIA
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

// 9) ACTUALIZAR VISTA RESPETANDO EL FILTRO ACTIVO
function actualizarVistaActual() {
    const termino = (inputBuscar?.value ?? "").trim().toLowerCase();
    const listaFiltrada = catalogoSuperArcade.filter(({ nombre }) =>
        nombre.toLowerCase().includes(termino)
    );
    renderizarCatalogo(listaFiltrada);
}

// 10) EVENTO SUBMIT CON TRY / CATCH / FINALLY + PERSISTENCIA
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
            `Se agregó "${nuevoJuego.nombre}" ($${nuevoJuego.precio}) y quedó guardado en localStorage.`
        );
    } catch (error) {
        mostrarFeedback(
            `⚠️ No se pudo procesar la operación (${error?.message ?? "intentá de nuevo"}).`,
            true
        );
    } finally {
        formJuego.reset();
        if (inputStock) {
            inputStock.value = "5";
        }
        inputNombre?.focus();
    }
});

// 11) EVENTO DE TECLADO PARA FILTRAR EN TIEMPO REAL
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

// 12) TEMPORIZADOR AL INGRESAR + CARGA ASÍNCRONA INICIAL
setTimeout(() => {
    mostrarAvisoComplementario(
        `🔔 Cotización de referencia hoy: $${COTIZACION_REFERENCIA_ARS} ARS — ¡Catálogo PS2 listo!`
    );
}, 2500);

renderizarCatalogo(catalogoSuperArcade);
cargarCatalogoAsync(false);