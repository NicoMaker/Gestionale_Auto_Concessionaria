/**
 * Client real-time: ascolta gli eventi Socket.IO emessi dal backend
 * (creazione/modifica/eliminazione record) e notifica il resto
 * dell'app tramite un semplice EventTarget, senza bisogno di reload.
 */
import { showToast } from "./components/Toast.js";

export const realtimeBus = new EventTarget();

const ACTION_LABEL = { create: "creato", update: "aggiornato", delete: "eliminato" };

export function initRealtime() {
  if (typeof io === "undefined") {
    console.warn("Socket.IO non caricato: aggiornamenti live disattivati.");
    return;
  }

  const socket = io();

  socket.on("connect", () => console.log("🔌 Real-time connesso"));
  socket.on("disconnect", () => console.log("🔌 Real-time disconnesso"));

  ["create", "update", "delete"].forEach((action) => {
    socket.on(`entity:${action}`, ({ entity, data }) => {
      realtimeBus.dispatchEvent(new CustomEvent("change", { detail: { entity, action, data } }));
    });
  });

  return socket;
}

/** Da chiamare dalle pagine entità per auto-aggiornarsi quando cambia un record della stessa tabella */
export function onEntityChange(entityName, callback) {
  const handler = (e) => {
    if (e.detail.entity === entityName) callback(e.detail.action, e.detail.data);
  };
  realtimeBus.addEventListener("change", handler);
  return () => realtimeBus.removeEventListener("change", handler);
}
