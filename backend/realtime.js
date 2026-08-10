/**
 * Modulo real-time basato su Socket.IO.
 * Notifica a tutti i client connessi ogni creazione/modifica/eliminazione
 * di record, così le tabelle a schermo si aggiornano da sole senza reload.
 */
let io = null;

function init(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Client connesso: ${socket.id} (totale: ${io.engine.clientsCount})`);

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnesso: ${socket.id} (totale: ${io.engine.clientsCount})`);
    });
  });

  return io;
}

/** Notifica un evento entity:<create|update|delete> a tutti i client */
function emitEntityChange(entityName, action, payload) {
  if (!io) return;
  io.emit(`entity:${action}`, { entity: entityName, data: payload });
  io.emit(`entity:${entityName}:${action}`, payload);
}

function getIO() {
  return io;
}

module.exports = { init, emitEntityChange, getIO };
