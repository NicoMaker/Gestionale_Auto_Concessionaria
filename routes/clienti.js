const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET tutti i clienti (con ricerca opzionale ?q=)
router.get('/', (req, res) => {
  const { q } = req.query;
  let sql = 'SELECT * FROM clienti';
  let params = [];
  if (q) {
    sql += ' WHERE nome LIKE ? OR cognome LIKE ? OR email LIKE ?';
    params = [`%${q}%`, `%${q}%`, `%${q}%`];
  }
  sql += ' ORDER BY id DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET singolo cliente
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM clienti WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Cliente non trovato' });
    res.json(row);
  });
});

// POST nuovo cliente
router.post('/', (req, res) => {
  const { nome, cognome, email, telefono, indirizzo } = req.body;
  if (!nome || !cognome) return res.status(400).json({ error: 'Nome e cognome sono obbligatori' });
  const sql = `INSERT INTO clienti (nome, cognome, email, telefono, indirizzo) VALUES (?,?,?,?,?)`;
  db.run(sql, [nome, cognome, email || null, telefono || null, indirizzo || null], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM clienti WHERE id = ?', [this.lastID], (e, row) => res.status(201).json(row));
  });
});

// PUT aggiorna cliente
router.put('/:id', (req, res) => {
  const { nome, cognome, email, telefono, indirizzo } = req.body;
  const sql = `UPDATE clienti SET nome=?, cognome=?, email=?, telefono=?, indirizzo=? WHERE id=?`;
  db.run(sql, [nome, cognome, email || null, telefono || null, indirizzo || null, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Cliente non trovato' });
    db.get('SELECT * FROM clienti WHERE id = ?', [req.params.id], (e, row) => res.json(row));
  });
});

// DELETE cliente
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM clienti WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Cliente non trovato' });
    res.json({ success: true });
  });
});

module.exports = router;
