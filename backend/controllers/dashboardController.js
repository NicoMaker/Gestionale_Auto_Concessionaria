const { db } = require("../config/db");

function all(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))));
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row))));
}

async function getStats(req, res, next) {
  try {
    const [autoTot, autoDisponibili, clienti, venditeMese, noleggiAttivi, fatturatoVendite, manutenzioniInCorso, scorteBasse] = await Promise.all([
      get("SELECT COUNT(*) n FROM auto"),
      get("SELECT COUNT(*) n FROM auto WHERE stato = 'disponibile'"),
      get("SELECT COUNT(*) n FROM clienti"),
      get("SELECT COUNT(*) n FROM vendite WHERE strftime('%Y-%m', data_vendita) = strftime('%Y-%m','now')"),
      get("SELECT COUNT(*) n FROM noleggi WHERE stato = 'in corso'"),
      get("SELECT COALESCE(SUM(prezzo_vendita - sconto),0) tot FROM vendite WHERE stato = 'completata'"),
      get("SELECT COUNT(*) n FROM manutenzioni WHERE data >= date('now','-30 day')"),
      get("SELECT COUNT(*) n FROM ricambi WHERE quantita_magazzino <= scorta_minima"),
    ]);

    const statoAuto = await all("SELECT stato, COUNT(*) n FROM auto GROUP BY stato");
    const venditeUltimiMesi = await all(`
      SELECT strftime('%Y-%m', data_vendita) mese, COUNT(*) n, COALESCE(SUM(prezzo_vendita - sconto),0) totale
      FROM vendite GROUP BY mese ORDER BY mese DESC LIMIT 6
    `);
    const topMarche = await all(`
      SELECT ma.nome marca, COUNT(*) n
      FROM auto a
      JOIN modelli m ON m.id = a.modello_id
      JOIN marche ma ON ma.id = m.marca_id
      GROUP BY ma.nome ORDER BY n DESC LIMIT 5
    `);

    res.json({
      autoTotali: autoTot.n,
      autoDisponibili: autoDisponibili.n,
      clientiTotali: clienti.n,
      venditeQuestoMese: venditeMese.n,
      noleggiAttivi: noleggiAttivi.n,
      fatturatoVendite: fatturatoVendite.tot,
      manutenzioniUltimi30gg: manutenzioniInCorso.n,
      scorteSottoSoglia: scorteBasse.n,
      statoAuto,
      venditeUltimiMesi: venditeUltimiMesi.reverse(),
      topMarche,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
