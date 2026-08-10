const express = require("express");
const cors = require("cors");
const path = require("path");

const { createTables } = require("./config/db");
const seed = require("./data/seed");
const apiRouter = require("./routes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Frontend servito come sito statico (cartella "frontend" allo stesso livello di "backend")
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND_DIR));

app.use("/api", apiRouter);

app.use("/api", notFound);

// SPA fallback: tutte le altre rotte servono index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.use(errorHandler);

createTables();
setTimeout(() => {
  seed().catch((err) => console.error("Errore seed:", err));
}, 300);

app.listen(PORT, () => {
  console.log(`\n🚗  Gestionale Auto Concessionaria avviato su http://localhost:${PORT}\n`);
});
