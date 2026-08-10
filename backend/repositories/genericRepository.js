const { db } = require("../config/db");

/**
 * Repository generico: costruisce query sicure (colonne whitelisted
 * dai metadati di schema.js, valori sempre parametrizzati) per
 * qualunque entità del gestionale.
 */
class GenericRepository {
  constructor(entity) {
    this.entity = entity;
    this.table = entity.name;
    this.columnNames = entity.columns.map((c) => c.name);
  }

  findAll({ search, limit, offset } = {}) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM ${this.table}`;
      const params = [];

      if (search) {
        const textCols = this.entity.columns.filter((c) => c.type === "TEXT").map((c) => c.name);
        if (textCols.length) {
          sql += ` WHERE ${textCols.map((c) => `${c} LIKE ?`).join(" OR ")}`;
          textCols.forEach(() => params.push(`%${search}%`));
        }
      }

      sql += " ORDER BY id DESC";
      if (limit) {
        sql += " LIMIT ?";
        params.push(Number(limit));
        if (offset) {
          sql += " OFFSET ?";
          params.push(Number(offset));
        }
      }

      db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  }

  count() {
    return new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) AS n FROM ${this.table}`, (err, row) => (err ? reject(err) : resolve(row.n)));
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM ${this.table} WHERE id = ?`, [id], (err, row) => (err ? reject(err) : resolve(row)));
    });
  }

  create(data) {
    return new Promise((resolve, reject) => {
      const cols = this.columnNames.filter((c) => data[c] !== undefined);
      const placeholders = cols.map(() => "?").join(",");
      const values = cols.map((c) => data[c]);
      const sql = `INSERT INTO ${this.table} (${cols.join(",")}) VALUES (${placeholders})`;
      db.run(sql, values, function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      const cols = this.columnNames.filter((c) => data[c] !== undefined);
      if (!cols.length) return resolve(0);
      const setClause = cols.map((c) => `${c} = ?`).join(", ");
      const values = cols.map((c) => data[c]);
      const sql = `UPDATE ${this.table} SET ${setClause}, updated_at = datetime('now') WHERE id = ?`;
      db.run(sql, [...values, id], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  remove(id) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM ${this.table} WHERE id = ?`, [id], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }
}

module.exports = GenericRepository;
