const express = require("express");
const cors = require("cors");
const path = require("path");

const apiRouter = require("./routes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

/**
 * Factory dell'app Express. Non avvia nulla: costruisce solo
 * l'istanza `app`, così server.js può crearci sopra http.Server
 * e agganciarci Socket.IO.
 */
function creaApp({ port } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
  app.use(express.static(FRONTEND_DIR));

  app.use("/api", apiRouter);
  app.use("/api", notFound);

  // SPA fallback: tutte le altre rotte servono index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "index.html"));
  });

  app.use(errorHandler);

  app.set("port", port);
  return app;
}

module.exports = { creaApp };
