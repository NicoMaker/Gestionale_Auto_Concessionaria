const express = require("express");
const router = express.Router();
const db = require("../db/database");

const SELECT_BASE = `
  SELECT auto.*, clienti.nome AS cliente_nome, clienti.cognome AS cliente_cognome
  FROM auto
  LEFT JOIN clienti ON clienti.id = auto.cliente_id
`;

// GET tutte le auto (filtri opzionali: ?q= ?stato=)
router.get("/", (req, res) => {
  const { q, stato } = req.query;
  let sql = SELECT_BASE + " WHERE 1=1";
  const params = [];
  if (q) {
    sql += " AND (targa LIKE ? OR marca LIKE ? OR modello LIKE ?)";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (stato) {
    sql += " AND auto.stato = ?";
    params.push(stato);
  }
  sql += " ORDER BY auto.id DESC";
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET statistiche dashboard
router.get("/stats/riepilogo", (req, res) => {
  db.get(
    `
    SELECT
      COUNT(*) AS totale,
      SUM(CASE WHEN stato = 'disponibile' THEN 1 ELSE 0 END) AS disponibili,
      SUM(CASE WHEN stato = 'venduta' THEN 1 ELSE 0 END) AS vendute,
      SUM(CASE WHEN stato = 'noleggiata' THEN 1 ELSE 0 END) AS noleggiate,
      SUM(CASE WHEN stato = 'manutenzione' THEN 1 ELSE 0 END) AS in_manutenzione,
      COALESCE(SUM(prezzo),0) AS valore_totale
    FROM auto
  `,
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT COUNT(*) AS totale_clienti FROM clienti", (err2, row2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        db.get(
          `SELECT COALESCE(SUM(costo),0) AS totale_costi FROM manutenzioni`,
          (err3, row3) => {
            if (err3) return res.status(500).json({ error: err3.message });
            res.json({ ...row, ...row2, ...row3 });
          },
        );
      });
    },
  );
});

// GET singola auto
router.get("/:id", (req, res) => {
  db.get(SELECT_BASE + " WHERE auto.id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Auto non trovata" });
    res.json(row);
  });
});

// POST nuova auto
router.post("/", (req, res) => {
  const { targa, marca, modello, anno, colore, km, prezzo, stato, cliente_id } =
    req.body;
  if (!targa || !marca || !modello) {
    return res
      .status(400)
      .json({ error: "Targa, marca e modello sono obbligatori" });
  }
  const sql = `INSERT INTO auto (targa, marca, modello, anno, colore, km, prezzo, stato, cliente_id)
               VALUES (?,?,?,?,?,?,?,?,?)`;
  db.run(
    sql,
    [
      targa,
      marca,
      modello,
      anno || null,
      colore || null,
      km || 0,
      prezzo || 0,
      stato || "disponibile",
      cliente_id || null,
    ],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE"))
          return res.status(409).json({ error: "Targa gia' esistente" });
        return res.status(500).json({ error: err.message });
      }
      db.get(SELECT_BASE + " WHERE auto.id = ?", [this.lastID], (e, row) =>
        res.status(201).json(row),
      );
    },
  );
});

// PUT aggiorna auto
router.put("/:id", (req, res) => {
  const { targa, marca, modello, anno, colore, km, prezzo, stato, cliente_id } =
    req.body;
  const sql = `UPDATE auto SET targa=?, marca=?, modello=?, anno=?, colore=?, km=?, prezzo=?, stato=?, cliente_id=?
               WHERE id=?`;
  db.run(
    sql,
    [
      targa,
      marca,
      modello,
      anno || null,
      colore || null,
      km || 0,
      prezzo || 0,
      stato,
      cliente_id || null,
      req.params.id,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "Auto non trovata" });
      db.get(SELECT_BASE + " WHERE auto.id = ?", [req.params.id], (e, row) =>
        res.json(row),
      );
    },
  );
});

// DELETE auto
router.delete("/:id", (req, res) => {
  db.run("DELETE FROM auto WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "Auto non trovata" });
    res.json({ success: true });
  });
});

module.exports = router;
