const express = require('express');
const cors = require('cors');
const path = require('path');

require('./db/database'); // inizializza il database

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/clienti', require('./routes/clienti'));
app.use('/api/auto', require('./routes/auto'));
app.use('/api/manutenzioni', require('./routes/manutenzioni'));
app.use('/api/noleggi', require('./routes/noleggi'));

// Tutte le altre rotte servono index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚗  Gestionale Auto avviato su http://localhost:${PORT}\n`);
});
