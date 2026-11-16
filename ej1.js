const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Inventario inicial usando arreglos
let disponibles = [
  "Cien años de soledad",
  "El Principito",
  "Don Quijote de la Mancha",
  "1984",
  "La Odisea",
];

let prestados = [];

// Función para limpiar texto (quita espacios extra, mayúsculas y tildes para evitar errores al buscar)
function normalizar(texto) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// 1. Menú Principal
function mostrarMenu() {
  console.log("\n--- BIBLIOTECA CENTRAL ---");
  console.log("1. Ver catálogo de libros");
  console.log("2. Agregar nuevo libro");
  console.log("3. Prestar libro");
  console.log("4. Devolver libro");
  console.log("5. Buscar libro");
  console.log("6. Salir");

  rl.question("\nElige una opción (1-6): ", (opcion) => {
    switch (opcion.trim()) {
      case "1":
        verCatalogo();
        break;
      case "2":
        agregarLibro();
        break;
      case "3":
        prestarLibro();
        break;
      case "4":
        devolverLibro();
        break;
      case "5":
        buscarLibro();
        break;
      case "6":
        console.log("\nSaliendo del sistema...");
        rl.close();
        break;
      default:
        console.log("\nOpción no válida. Intenta de nuevo.");
        mostrarMenu();
        break;
    }
  });
}

// 2. Gestión y Visualización del Catálogo
function verCatalogo() {
  console.log("\n--- LIBROS DISPONIBLES ---");
  if (disponibles.length === 0) {
    console.log("No hay libros en estantería.");
  } else {
    // Uso de .map() visto en la guía
    const lista = disponibles.map((libro, i) => `${i + 1}. ${libro} [Disponible]`);
    console.log(lista.join("\n"));
  }

  console.log("\n--- LIBROS PRESTADOS ---");
  if (prestados.length === 0) {
    console.log("No hay libros prestados.");
  } else {
    const listaPrestados = prestados.map((libro, i) => `${i + 1}. ${libro} [Prestado]`);
    console.log(listaPrestados.join("\n"));
  }

  mostrarMenu();
}

// 3. Ingreso de Nuevos Ejemplares
function agregarLibro() {
  rl.question("\nNombre del nuevo libro: ", (titulo) => {
    const nombreLimpio = titulo.trim();

    if (nombreLimpio === "") {
      console.log("El nombre no puede quedar vacío.");
      return mostrarMenu();
    }

    // Verificar que no exista ya
    const yaExiste = [...disponibles, ...prestados].some(
      (libro) => normalizar(libro) === normalizar(nombreLimpio)
    );

    if (yaExiste) {
      console.log("Ese libro ya está registrado en el sistema.");
      return mostrarMenu();
    }

    console.log("¿Dónde quieres guardarlo?");
    console.log("1. Al inicio (Novedad / Urgente)");
    console.log("2. Al final (Inventario general)");

    rl.question("Elige (1 o 2): ", (pos) => {
      if (pos.trim() === "1") {
        // Uso del Spread Operator (...) para agregar al inicio
        disponibles = [nombreLimpio, ...disponibles];
        console.log(`"${nombreLimpio}" agregado al inicio.`);
      } else if (pos.trim() === "2") {
        // Uso del Spread Operator (...) para agregar al final
        disponibles = [...disponibles, nombreLimpio];
        console.log(`"${nombreLimpio}" agregado al final.`);
      } else {
        console.log("Opción incorrecta. No se guardó el libro.");
      }
      mostrarMenu();
    });
  });
}

// 4. Módulo de Préstamos
function prestarLibro() {
  if (disponibles.length === 0) {
    console.log("\nNo quedan libros disponibles para prestar.");
    return mostrarMenu();
  }

  console.log("\nDisponibles actualmente:");
  disponibles.forEach((libro, i) => console.log(`${i + 1}. ${libro}`));

  rl.question("\nEscribe el nombre o número del libro a prestar: ", (entrada) => {
    let indice = -1;
    const numero = parseInt(entrada.trim());

    // Permite elegir por número de lista o escribiendo el nombre
    if (!isNaN(numero) && numero >= 1 && numero <= disponibles.length) {
      indice = numero - 1;
    } else {
      indice = disponibles.findIndex(
        (libro) => normalizar(libro) === normalizar(entrada)
      );
    }

    if (indice !== -1) {
      // Desestructuración para sacar el libro del arreglo
      const [libroElegido] = disponibles.splice(indice, 1);
      prestados = [...prestados, libroElegido];
      console.log(`\nListo. Se prestó: "${libroElegido}".`);
    } else {
      const estaPrestado = prestados.some(
        (libro) => normalizar(libro) === normalizar(entrada)
      );
      if (estaPrestado) {
        console.log("\nEse libro ya está prestado a otro usuario.");
      } else {
        console.log("\nNo se encontró ese libro en disponibles.");
      }
    }

    mostrarMenu();
  });
}

// 5. Módulo de Devoluciones
function devolverLibro() {
  if (prestados.length === 0) {
    console.log("\nNo hay libros prestados por devolver.");
    return mostrarMenu();
  }

  console.log("\nLibros actualmente prestados:");
  prestados.forEach((libro, i) => console.log(`${i + 1}. ${libro}`));

  rl.question("\nEscribe el nombre o número del libro a devolver: ", (entrada) => {
    let indice = -1;
    const numero = parseInt(entrada.trim());

    if (!isNaN(numero) && numero >= 1 && numero <= prestados.length) {
      indice = numero - 1;
    } else {
      indice = prestados.findIndex(
        (libro) => normalizar(libro) === normalizar(entrada)
      );
    }

    if (indice !== -1) {
      const [libroDevuelto] = prestados.splice(indice, 1);
      disponibles = [...disponibles, libroDevuelto];
      console.log(`\nDevuelto: "${libroDevuelto}" vuelve a estar disponible.`);
    } else {
      console.log("\nEse libro no aparece en la lista de prestados.");
    }

    mostrarMenu();
  });
}

// 6. Búsqueda y Verificación de Estado
function buscarLibro() {
  rl.question("\nEscribe el nombre o palabra clave del libro: ", (clave) => {
    const busqueda = normalizar(clave);

    if (busqueda === "") {
      console.log("Debes escribir algo para buscar.");
      return mostrarMenu();
    }

    const enDisponibles = disponibles.filter((libro) =>
      normalizar(libro).includes(busqueda)
    );
    const enPrestados = prestados.filter((libro) =>
      normalizar(libro).includes(busqueda)
    );

    console.log("\n--- Resultados ---");
    if (enDisponibles.length === 0 && enPrestados.length === 0) {
      console.log("No se encontró ningún libro con ese nombre.");
    } else {
      enDisponibles.forEach((libro) => console.log(`- ${libro} -> DISPONIBLE`));
      enPrestados.forEach((libro) => console.log(`- ${libro} -> PRESTADO`));
    }

    mostrarMenu();
  });
}

// Iniciar programa
mostrarMenu();