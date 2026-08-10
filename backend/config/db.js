const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const SCHEMA = require("../data/schema");

const DB_PATH = path.join(__dirname, "..", "data", "gestionale.db");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error("❌ Errore apertura database:", err.message);
  else console.log("✅ Connesso al database SQLite:", DB_PATH);
});

/** Genera la clausola SQL di una colonna a partire dai metadati */
function columnDefinition(col) {
  let def = `${col.name} ${col.type === "BOOLEAN" ? "INTEGER" : col.type === "DATE" || col.type === "DATETIME" ? "TEXT" : col.type}`;
  if (col.required) def += " NOT NULL";
  if (col.unique) def += " UNIQUE";
  if (col.default !== undefined) def += ` DEFAULT ${col.default}`;
  return def;
}

/** Crea (se non esiste) ogni tabella definita nello schema, con relative FK */
function createTables() {
  db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

    SCHEMA.forEach((entity) => {
      const cols = [
        "id INTEGER PRIMARY KEY AUTOINCREMENT",
        ...entity.columns.map(columnDefinition),
        "created_at TEXT DEFAULT (datetime('now'))",
        "updated_at TEXT DEFAULT (datetime('now'))",
      ];

      const fks = entity.columns
        .filter((c) => c.fk)
        .map(
          (c) =>
            `FOREIGN KEY (${c.name}) REFERENCES ${c.fk.table}(id) ON DELETE ${c.fk.onDelete || "SET NULL"}`,
        );

      const sql = `CREATE TABLE IF NOT EXISTS ${entity.name} (\n  ${[...cols, ...fks].join(",\n  ")}\n)`;
      db.run(sql, (err) => {
        if (err) console.error(`Errore creazione tabella ${entity.name}:`, err.message);
      });
    });
  });
}

module.exports = { db, createTables };
