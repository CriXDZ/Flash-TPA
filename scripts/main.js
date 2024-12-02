/*
"copyright": "© 2024 CriXDZ"
"author": "CriXDZ"
"github": "https://github.com/CriXDZ"
"description": "Este script de TPA ha sido creado por CriXDZ.Todos los derechos reservados.
"notes": "Para más información y actualizaciones, sigue a CriXDZ en GitHub.
*/

import * as mc from "@minecraft/server";

console.warn("[main.js loaded]: Loading");

// Manejo de errores en la suscripción a eventos
try {
  mc.world.afterEvents.worldInitialize.subscribe((data) => {
    try {
      // Enviar un mensaje al mundo indicando que el addon se ha cargado
      mc.world.sendMessage("§6[Flash TPA] §r| §aActivado §r|");

      // Intentar importar dinámicamente el archivo index.js
      import("./gui/index.js")
        .then((tpaAPI) => {
          console.log("[Flash TPA]: API cargada correctamente");
          // Lógica adicional para inicialización del API, si es necesario
        })
        .catch((error) => {
          console.error("[Error al cargar index.js]:", error);
          mc.world.sendMessage(
            "§c[Flash TPA]: Error al cargar la interfaz de TPA."
          );
        });
    } catch (error) {
      console.error("[Error en worldInitialize]:", error);
    }
  });
} catch (error) {
  console.error("[Error en la suscripción a afterEvents]:", error);
}

// Función para inicializar el addon
function initializeAddon() {
  console.log("[Flash TPA]: Inicializando addon...");
  // Aquí puedes agregar cualquier lógica de inicialización adicional
}

// Llamar a la función de inicialización del addon
initializeAddon();
