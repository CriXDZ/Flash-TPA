/*
"copyright": "© 2024 CriXDZ"
"author": "CriXDZ"
"github": "https://github.com/CriXDZ"
"description": "Este script de TPA ha sido creado por CriXDZ.Todos los derechos reservados.
"notes": "Para más información y actualizaciones, sigue a CriXDZ en GitHub.
*/

console.warn("main.js cargado");

import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

const tpaRequests = new Map();
const lastTpaTime = new Map(); // Almacena el último tiempo en que se usó TPA
const COOLDOWN_TIME = 60 * 1000; // Cooldown de 60 segundos en milisegundos

world.beforeEvents.itemUse.subscribe((data) => {
  let player = data.source;
  let title = "§o§uAdministrador de TPA";
  if (data.itemStack.typeId === "minecraft:compass")
    system.run(() => main(player));

  function main() {
    const form = new ActionFormData()
      .title(title)
      .body(`§o§5¡Elija una opción a continuación!`)
      .button(`§3Solicitar TPA\n§7[ Haga clic para solicitar teletransporte ]`)
      .button(`§aAceptar TPA\n§7[ Haga clic para aceptar teletransporte ]`)
      .button(`§cSalir del Menú`);
    form.show(player).then((r) => {
      if (r.selection === 0) requestTpa(player);
      if (r.selection === 1) acceptTpa(player);
    });
  }

  function requestTpa(player) {
    const currentTime = Date.now();
    const lastTime = lastTpaTime.get(player.nameTag) || 0;

    if (currentTime - lastTime < COOLDOWN_TIME) {
      const remainingTime = Math.ceil(
        (COOLDOWN_TIME - (currentTime - lastTime)) / 1000
      );
      player.sendMessage(
        `§cDebe esperar ${remainingTime} segundos antes de usar TPA nuevamente.`
      );
      return;
    }

    let players = Array.from(world.getPlayers());
    let playerNames = players
      .map((p) => p.nameTag)
      .filter((name) => name !== player.nameTag);

    if (playerNames.length === 0) {
      player.sendMessage(
        `§cNo hay otros jugadores en línea para solicitar un TPA.`
      );
      return;
    }

    new ModalFormData()
      .title("Solicitar TPA")
      .dropdown("Elija el jugador:", playerNames)
      .show(player)
      .then((r) => {
        if (!r.canceled) {
          let targetName = playerNames[r.formValues[0]];
          let targetPlayer = players.find((p) => p.nameTag === targetName);

          if (targetPlayer) {
            tpaRequests.set(targetPlayer.nameTag, player.nameTag);
            lastTpaTime.set(player.nameTag, currentTime);
            targetPlayer.sendMessage(
              `§a${player.nameTag} desea teletransportarse a usted. Use la brújula para aceptar.`
            );
            player.sendMessage(`§aSolicitud de TPA enviada a ${targetName}.`);
          } else {
            player.sendMessage(`§cJugador no encontrado.`);
          }
        }
      })
      .catch((error) => {
        player.sendMessage(`§cHubo un error al procesar su solicitud.`);
        console.error(error);
      });
  }

  function acceptTpa(player) {
    let requestorName = tpaRequests.get(player.nameTag);

    if (requestorName) {
      let requestorPlayer = Array.from(world.getPlayers()).find(
        (p) => p.nameTag === requestorName
      );

      if (requestorPlayer) {
        const confirmationForm = new ActionFormData()
          .title("Confirmar Teletransporte")
          .body(
            `¿Desea aceptar la solicitud de teletransporte de ${requestorName}?`
          )
          .button(`§aSí`)
          .button(`§cNo`);

        confirmationForm
          .show(player)
          .then((response) => {
            if (response.selection === 0) {
              requestorPlayer.runCommandAsync(
                `tp @s ${player.location.x} ${player.location.y} ${player.location.z}`
              );
              requestorPlayer.sendMessage(
                `§aTeletransportado a ${player.nameTag}.`
              );
              player.sendMessage(
                `§a${requestorName} ha sido teletransportado a usted.`
              );
              tpaRequests.delete(player.nameTag);
            } else {
              player.sendMessage(`§cTeletransporte cancelado.`);
              requestorPlayer.sendMessage(
                `§cSu solicitud de teletransporte fue rechazada.`
              );
            }
          })
          .catch((error) => {
            player.sendMessage(
              `§cHubo un error al procesar la solicitud de confirmación.`
            );
            console.error(error);
          });
      } else {
        player.sendMessage(`§cSolicitante no encontrado.`);
        tpaRequests.delete(player.nameTag);
      }
    } else {
      player.sendMessage(`§cNo tiene ninguna solicitud de TPA.`);
    }
  }
});
