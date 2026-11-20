
// 1) APLICACION DEFINICIÓN DE LA CLASE (productos con 4 propiedades esenciales)
class Juego {
    constructor(id, nombre, precio, stock) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
    }

    // 2) UN MÉTODO DE INSTANCIA (Método que modifica el estado del objeto (resta stock y valida))
    venderUnidad(cantidadSolicitada) {
        if (this.stock >= cantidadSolicitada) {
            this.stock -= cantidadSolicitada;
            console.log(`✅ Venta exitosa: ${cantidadSolicitada} unidad(es) de "${this.nombre}". Stock restante: ${this.stock}`);
            return true;
        } else {
            console.log(`❌ Stock insuficiente para "${this.nombre}". Stock disponible: ${this.stock}`);
            alert(`⚠️ No hay suficiente stock de "${this.nombre}".`);
            return false;
        }
    }

    // Método extra para mostrar detalles
    mostrarInfo() {
        return `${this.nombre} - Precio: $${this.precio} (Stock: ${this.stock})`;
    }
}

// 3) INSTANCIACIÓN (Creación de al menos tres objetos reales usando 'new')
const juego1 = new Juego(1, "GTA San Andreas", 3500, 10);
const juego2 = new Juego(2, "Resident Evil 4", 3000, 5);
const juego3 = new Juego(3, "God of War II", 3200, 8);
const juego4 = new Juego(4, "Dragon Ball Z Budokai Tenkaichi 3", 3000, 12);
const juego5 = new Juego(5, "Gran Turismo 3", 3400, 6);

// Guardamos instancias en el array del catálogo de Super-Arcade
const catalogoSuperArcade = [juego1, juego2, juego3, juego4, juego5];

// Pruebas rápidas en consola de los métodos de instancia (Requisito de verificación)
console.log("--- ESTADO INICIAL DE CATÁLOGO ---");
catalogoSuperArcade.forEach(juego => console.log(juego.mostrarInfo()));

// Verificación con .some() si existe al menos un juego con el stock
const hayStockEnTienda = catalogoSuperArcade.some(juego => juego.stock > 0);
console.log("¿Hay al menos un juego con stock disponible?", hayStockEnTienda);

// 4) VARIABLES DEL SIMULADOR
const carrito = [];
let totalCompra = 0;
let cantidadJuegos = 0;
let opcion = "";

// Función de Flecha para calcular descuentos
const calcularMontoDescuento = (subtotal, porcentaje) => subtotal * (porcentaje / 100);

// Función de Salida / Resumen de Compra
const mostrarResumenFinal = function (totalItems, descuentoAplicado, montoFinal) {
    let mensajeResumen = "📄 RESUMEN DE COMPRA Super-Arcade:\n" +
        "- Cantidad de juegos: " + totalItems + "\n" +
        "- Descuento aplicado: $" + descuentoAplicado + "\n" +
        "- Total a Pagar: $" + montoFinal + "\n\n" +
        "¡Gracias por tu compra!";

    console.log(mensajeResumen);
    alert(mensajeResumen);
};

// 5) COMIENZO DEL SIMULADOR E INTERACCIÓN
alert("🎮 ¡Bienvenido a Super-Arcade!");

// Bucle While para el menú interactivo
while (opcion !== "7" && opcion !== "ESC" && opcion !== "esc") {
    // .map() transforma cada objeto Juego en una línea de texto para el menú
    const menuJuegos = catalogoSuperArcade
        .map(juego => `${juego.id}. ${juego.nombre} ($${juego.precio})`)
        .join("\n");

    opcion = prompt(
        "GAME LIST (Selecciona un juego):\n" +
        menuJuegos + "\n" +
        "6. Ver juegos hasta $3200 (filtro)\n" +
        "7. Finalizar compra\n" +
        "🛒 Llevas " + cantidadJuegos + " juego(s)" + " | Total actual: $" + totalCompra
    );

    if (opcion === "7" || opcion === "ESC" || opcion === "esc") {
        console.log("🛒 Finalizando proceso de Compra...");
    } else if (opcion === "6") {
        // .filter() devuelve un nuevo array con los juegos de precio 
        const juegosEconomicos = catalogoSuperArcade.filter(juego => juego.precio <= 3200);
        console.log("--- 💰 JUEGOS HASTA $3200 (.filter) ---");
        juegosEconomicos.forEach(juego => console.log(juego.mostrarInfo()));

        const textoFiltro = juegosEconomicos.map(juego => `- ${juego.nombre} ($${juego.precio})`).join("\n");
        alert("Juegos hasta $3200:\n" + textoFiltro);
    } else {
        // .find() busca en el catálogo el juego cuyo id coincida con lo ingresado
        const idSeleccionado = Number(opcion);
        const juegoEncontrado = catalogoSuperArcade.find(juego => juego.id === idSeleccionado);

        if (juegoEncontrado) {
            if (juegoEncontrado.venderUnidad(1)) {
                carrito.push(juegoEncontrado);
                cantidadJuegos = carrito.length;
                // .reduce() calculamos el total acumulado del carrito
                totalCompra = carrito.reduce((acumulador, juego) => acumulador + juego.precio, 0);
            }
        } else {
            console.log("⚠️ Opción no válida ingresada: " + opcion);
            alert("⚠️ Opción incorrecta. Por favor ingrese un número válido.");
        }
    }
}

// 6) RESULTADO FINAL Y APLICACIÓN DE DESCUENTO
if (cantidadJuegos > 0) {
    let descuento = 0;
    if (cantidadJuegos >= 3) {
        descuento = calcularMontoDescuento(totalCompra, 15);
        totalCompra -= descuento;
        console.log("¡Promoción aplicada! 15% de Descuento: -$" + descuento);
    }
    mostrarResumenFinal(cantidadJuegos, descuento, totalCompra);
} else {
    console.log("👋 Saliste del simulador sin comprar ningún juego.");
    alert("👋 No agregaste juegos al carrito.");
}

// 7) REPORTE ITERATIVO FINAL USANDO FOR...OF
console.log("--- 📋 ESTADO FINAL DEL INVENTARIO TRAS LAS COMPRAS ---");
for (const juego of catalogoSuperArcade) {
    console.log(juego.mostrarInfo());
}