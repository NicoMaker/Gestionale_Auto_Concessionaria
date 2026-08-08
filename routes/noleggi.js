const express = require('express');
const router = express.Router();
const db = require('../db/database');

const SELECT_BASE = `
  SELECT noleggi.*, auto.targa, auto.marca, auto.modello,
         clienti.nome AS cliente_nome, clienti.cognome AS cliente_cognome
  FROM noleggi
  JOIN auto ON auto.id = noleggi.auto_id
  JOIN clienti ON clienti.id = noleggi.cliente_id
`;

// GET tutti i noleggi
router.get('/', (req, res) => {
  db.all(SELECT_BASE + ' ORDER BY noleggi.id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST nuovo noleggio
router.post('/', (req, res) => {
  const { auto_id, cliente_id, data_inizio, data_fine, prezzo_giornaliero, stato } = req.body;
  if (!auto_id || !cliente_id || !data_inizio) {
    return res.status(400).json({ error: 'Auto, cliente e data inizio sono obbligatori' });
  }
  const sql = `INSERT INTO noleggi (auto_id, cliente_id, data_inizio, data_fine, prezzo_giornaliero, stato)
               VALUES (?,?,?,?,?,?)`;
  db.run(sql, [auto_id, cliente_id, data_inizio, data_fine || null, prezzo_giornaliero || 0, stato || 'in corso'], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run('UPDATE auto SET stato = ? WHERE id = ?', ['noleggiata', auto_id]);
    db.get(SELECT_BASE + ' WHERE noleggi.id = ?', [this.lastID], (e, row) => res.status(201).json(row));
  });
});

// PUT aggiorna noleggio
router.put('/:id', (req, res) => {
  const { auto_id, cliente_id, data_inizio, data_fine, prezzo_giornaliero, stato } = req.body;
  const sql = `UPDATE noleggi SET auto_id=?, cliente_id=?, data_inizio=?, data_fine=?, prezzo_giornaliero=?, stato=?
               WHERE id=?`;
  db.run(sql, [auto_id, cliente_id, data_inizio, data_fine || null, prezzo_giornaliero || 0, stato, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Noleggio non trovato' });
    if (stato === 'concluso') {
      db.run('UPDATE auto SET stato = ? WHERE id = ?', ['disponibile', auto_id]);
    }
    db.get(SELECT_BASE + ' WHERE noleggi.id = ?', [req.params.id], (e, row) => res.json(row));
  });
});

// DELETE noleggio
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM noleggi WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Noleggio non trovato' });
    res.json({ success: true });
  });
});

module.exports = router;
