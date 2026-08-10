/* Gestione centralizzata degli errori (inclusi vincoli SQLite) */
function errorHandler(err, req, res, next) {
  console.error("❌", err.message);

  if (err.message && err.message.includes("UNIQUE constraint failed")) {
    return res.status(409).json({ error: "Valore duplicato: un record con questi dati esiste già." });
  }
  if (err.message && err.message.includes("FOREIGN KEY constraint failed")) {
    return res.status(409).json({ error: "Operazione non consentita: il record è collegato ad altri dati." });
  }

  res.status(500).json({ error: "Errore interno del server." });
}

function notFound(req, res) {
  res.status(404).json({ error: "Risorsa non trovata." });
}

module.exports = { errorHandler, notFound };
