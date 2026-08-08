const express = require("express");
const router = express.Router();
const db = require("../db/database");

const SELECT_BASE = `
  SELECT manutenzioni.*, auto.targa, auto.marca, auto.modello
  FROM manutenzioni
  JOIN auto ON auto.id = manutenzioni.auto_id
`;

// GET tutte le manutenzioni (filtro opzionale ?auto_id=)
router.get("/", (req, res) => {
  const { auto_id } = req.query;
  let sql = SELECT_BASE;
  const params = [];
  if (auto_id) {
    sql += " WHERE manutenzioni.auto_id = ?";
    params.push(auto_id);
  }
  sql += " ORDER BY manutenzioni.data DESC, manutenzioni.id DESC";
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST nuova manutenzione
router.post("/", (req, res) => {
  const { auto_id, data, tipo, descrizione, costo, km } = req.body;
  if (!auto_id || !data || !tipo) {
    return res
      .status(400)
      .json({ error: "Auto, data e tipo sono obbligatori" });
  }
  const sql = `INSERT INTO manutenzioni (auto_id, data, tipo, descrizione, costo, km) VALUES (?,?,?,?,?,?)`;
  db.run(
    sql,
    [auto_id, data, tipo, descrizione || null, costo || 0, km || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(
        SELECT_BASE + " WHERE manutenzioni.id = ?",
        [this.lastID],
        (e, row) => res.status(201).json(row),
      );
    },
  );
});

// PUT aggiorna manutenzione
router.put("/:id", (req, res) => {
  const { auto_id, data, tipo, descrizione, costo, km } = req.body;
  const sql = `UPDATE manutenzioni SET auto_id=?, data=?, tipo=?, descrizione=?, costo=?, km=? WHERE id=?`;
  db.run(
    sql,
    [
      auto_id,
      data,
      tipo,
      descrizione || null,
      costo || 0,
      km || null,
      req.params.id,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "Manutenzione non trovata" });
      db.get(
        SELECT_BASE + " WHERE manutenzioni.id = ?",
        [req.params.id],
        (e, row) => res.json(row),
      );
    },
  );
});

// DELETE manutenzione
router.delete("/:id", (req, res) => {
  db.run(
    "DELETE FROM manutenzioni WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "Manutenzione non trovata" });
      res.json({ success: true });
    },
  );
});

module.exports = router;
