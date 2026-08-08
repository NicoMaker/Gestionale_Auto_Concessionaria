const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "gestionale.db");
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Errore apertura database:", err.message);
  } else {
    console.log("Connesso al database SQLite:", DB_PATH);
  }
});

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");

  db.run(`
    CREATE TABLE IF NOT EXISTS clienti (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cognome TEXT NOT NULL,
      email TEXT,
      telefono TEXT,
      indirizzo TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS auto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      targa TEXT NOT NULL UNIQUE,
      marca TEXT NOT NULL,
      modello TEXT NOT NULL,
      anno INTEGER,
      colore TEXT,
      km INTEGER DEFAULT 0,
      prezzo REAL DEFAULT 0,
      stato TEXT NOT NULL DEFAULT 'disponibile',
      cliente_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (cliente_id) REFERENCES clienti(id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS manutenzioni (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auto_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      tipo TEXT NOT NULL,
      descrizione TEXT,
      costo REAL DEFAULT 0,
      km INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (auto_id) REFERENCES auto(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS noleggi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auto_id INTEGER NOT NULL,
      cliente_id INTEGER NOT NULL,
      data_inizio TEXT NOT NULL,
      data_fine TEXT,
      prezzo_giornaliero REAL DEFAULT 0,
      stato TEXT NOT NULL DEFAULT 'in corso',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (auto_id) REFERENCES auto(id) ON DELETE CASCADE,
      FOREIGN KEY (cliente_id) REFERENCES clienti(id) ON DELETE CASCADE
    )
  `);

  // Seed di esempio solo se il db e' vuoto
  db.get("SELECT COUNT(*) AS n FROM auto", (err, row) => {
    if (!err && row && row.n === 0) {
      const clienti = [
        [
          "Mario",
          "Rossi",
          "mario.rossi@email.it",
          "3331112222",
          "Via Roma 1, Verona",
        ],
        [
          "Giulia",
          "Bianchi",
          "giulia.bianchi@email.it",
          "3332223333",
          "Via Milano 5, Verona",
        ],
        [
          "Luca",
          "Verdi",
          "luca.verdi@email.it",
          "3333334444",
          "Corso Italia 12, Padova",
        ],
      ];
      const stmtC = db.prepare(
        `INSERT INTO clienti (nome, cognome, email, telefono, indirizzo) VALUES (?,?,?,?,?)`,
      );
      clienti.forEach((c) => stmtC.run(c));
      stmtC.finalize(() => {
        const auto = [
          [
            "AB123CD",
            "Fiat",
            "Panda",
            2021,
            "Bianco",
            32000,
            9800,
            "disponibile",
            null,
          ],
          [
            "EF456GH",
            "Volkswagen",
            "Golf",
            2020,
            "Grigio",
            48000,
            15900,
            "venduta",
            1,
          ],
          [
            "IL789MN",
            "Toyota",
            "Yaris",
            2022,
            "Rosso",
            12000,
            17500,
            "noleggiata",
            2,
          ],
          [
            "OP012QR",
            "Audi",
            "A3",
            2019,
            "Nero",
            61000,
            19900,
            "manutenzione",
            null,
          ],
        ];
        const stmtA = db.prepare(
          `INSERT INTO auto (targa, marca, modello, anno, colore, km, prezzo, stato, cliente_id) VALUES (?,?,?,?,?,?,?,?,?)`,
        );
        auto.forEach((a) => stmtA.run(a));
        stmtA.finalize();
      });
    }
  });
});

module.exports = db;
