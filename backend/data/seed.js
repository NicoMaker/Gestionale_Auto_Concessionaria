const { db } = require("../config/db");

/** Esegue un INSERT e restituisce una Promise con l'id inserito */
function insert(table, columns, values) {
  return new Promise((resolve, reject) => {
    const placeholders = columns.map(() => "?").join(",");
    const sql = `INSERT INTO ${table} (${columns.join(",")}) VALUES (${placeholders})`;
    db.run(sql, values, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

function isEmpty(table) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) AS n FROM ${table}`, (err, row) => {
      if (err) reject(err);
      else resolve(row.n === 0);
    });
  });
}

async function seed() {
  if (!(await isEmpty("clienti"))) {
    console.log("ℹ️  Database già popolato, seed saltato.");
    return;
  }
  console.log("🌱 Popolamento dati di esempio...");

  const sedi = await Promise.all([
    insert("sedi", ["nome", "indirizzo", "citta", "cap", "telefono", "email"], ["Concessionaria Verona Centro", "Via Roma 10", "Verona", "37121", "0451234567", "verona@autogest.it"]),
    insert("sedi", ["nome", "indirizzo", "citta", "cap", "telefono", "email"], ["Concessionaria Padova Est", "Via Milano 22", "Padova", "35131", "0497654321", "padova@autogest.it"]),
  ]);

  const ruoli = await Promise.all([
    insert("ruoli", ["nome", "descrizione"], ["Venditore", "Gestione vendite e clienti"]),
    insert("ruoli", ["nome", "descrizione"], ["Meccanico", "Manutenzioni e revisioni"]),
    insert("ruoli", ["nome", "descrizione"], ["Responsabile", "Gestione sede"]),
  ]);

  const dipendenti = await Promise.all([
    insert("dipendenti", ["nome", "cognome", "email", "telefono", "ruolo_id", "sede_id", "data_assunzione", "stipendio", "attivo"], ["Marco", "Ferrari", "m.ferrari@autogest.it", "3401112233", ruoli[0], sedi[0], "2021-03-01", 1800, 1]),
    insert("dipendenti", ["nome", "cognome", "email", "telefono", "ruolo_id", "sede_id", "data_assunzione", "stipendio", "attivo"], ["Sara", "Colombo", "s.colombo@autogest.it", "3402223344", ruoli[1], sedi[0], "2020-06-15", 1700, 1]),
    insert("dipendenti", ["nome", "cognome", "email", "telefono", "ruolo_id", "sede_id", "data_assunzione", "stipendio", "attivo"], ["Andrea", "Bruno", "a.bruno@autogest.it", "3403334455", ruoli[2], sedi[1], "2019-01-10", 2400, 1]),
  ]);

  const clienti = await Promise.all([
    insert("clienti", ["nome", "cognome", "email", "telefono", "indirizzo", "citta", "cap", "codice_fiscale", "data_nascita", "note"], ["Mario", "Rossi", "mario.rossi@email.it", "3331112222", "Via Roma 1", "Verona", "37121", "RSSMRA80A01L781X", "1980-01-01", "Cliente storico"]),
    insert("clienti", ["nome", "cognome", "email", "telefono", "indirizzo", "citta", "cap", "codice_fiscale", "data_nascita", "note"], ["Giulia", "Bianchi", "giulia.bianchi@email.it", "3332223333", "Via Milano 5", "Verona", "37122", "BNCGLI85B41L781Y", "1985-02-01", ""]),
    insert("clienti", ["nome", "cognome", "email", "telefono", "indirizzo", "citta", "cap", "codice_fiscale", "data_nascita", "note"], ["Luca", "Verdi", "luca.verdi@email.it", "3333334444", "Corso Italia 12", "Padova", "35100", "VRDLCU90C11G224Z", "1990-03-11", ""]),
    insert("clienti", ["nome", "cognome", "email", "telefono", "indirizzo", "citta", "cap", "codice_fiscale", "data_nascita", "note"], ["Anna", "Neri", "anna.neri@email.it", "3334445555", "Via Torino 8", "Padova", "35131", "NREANN88D50G224W", "1988-04-10", "Preferisce contatto email"]),
  ]);

  const marche = await Promise.all([
    insert("marche", ["nome", "paese_origine", "logo_url"], ["Fiat", "Italia", ""]),
    insert("marche", ["nome", "paese_origine", "logo_url"], ["Volkswagen", "Germania", ""]),
    insert("marche", ["nome", "paese_origine", "logo_url"], ["Toyota", "Giappone", ""]),
    insert("marche", ["nome", "paese_origine", "logo_url"], ["Audi", "Germania", ""]),
  ]);

  const categorie = await Promise.all([
    insert("categorie", ["nome", "descrizione"], ["City car", "Utilitarie compatte per la città"]),
    insert("categorie", ["nome", "descrizione"], ["Berlina", "Comfort ed eleganza"]),
    insert("categorie", ["nome", "descrizione"], ["SUV", "Spazio e versatilità"]),
  ]);

  const modelli = await Promise.all([
    insert("modelli", ["marca_id", "categoria_id", "nome", "anno_inizio_produzione"], [marche[0], categorie[0], "Panda", 2011]),
    insert("modelli", ["marca_id", "categoria_id", "nome", "anno_inizio_produzione"], [marche[1], categorie[1], "Golf", 2019]),
    insert("modelli", ["marca_id", "categoria_id", "nome", "anno_inizio_produzione"], [marche[2], categorie[0], "Yaris", 2020]),
    insert("modelli", ["marca_id", "categoria_id", "nome", "anno_inizio_produzione"], [marche[3], categorie[2], "Q3", 2018]),
  ]);

  const auto = await Promise.all([
    insert("auto", ["targa", "modello_id", "anno", "colore", "km", "prezzo", "prezzo_acquisto", "stato", "alimentazione", "cambio", "cilindrata", "potenza_cv", "cliente_id", "sede_id", "venditore_id"], ["AB123CD", modelli[0], 2021, "Bianco", 32000, 9800, 7200, "disponibile", "benzina", "manuale", 1200, 69, null, sedi[0], dipendenti[0]]),
    insert("auto", ["targa", "modello_id", "anno", "colore", "km", "prezzo", "prezzo_acquisto", "stato", "alimentazione", "cambio", "cilindrata", "potenza_cv", "cliente_id", "sede_id", "venditore_id"], ["EF456GH", modelli[1], 2020, "Grigio", 48000, 15900, 12500, "venduta", "diesel", "automatico", 2000, 150, clienti[0], sedi[0], dipendenti[0]]),
    insert("auto", ["targa", "modello_id", "anno", "colore", "km", "prezzo", "prezzo_acquisto", "stato", "alimentazione", "cambio", "cilindrata", "potenza_cv", "cliente_id", "sede_id", "venditore_id"], ["IL789MN", modelli[2], 2022, "Rosso", 12000, 17500, 14000, "noleggiata", "ibrida", "automatico", 1500, 116, clienti[1], sedi[1], dipendenti[2]]),
    insert("auto", ["targa", "modello_id", "anno", "colore", "km", "prezzo", "prezzo_acquisto", "stato", "alimentazione", "cambio", "cilindrata", "potenza_cv", "cliente_id", "sede_id", "venditore_id"], ["OP012QR", modelli[3], 2019, "Nero", 61000, 19900, 16000, "manutenzione", "diesel", "automatico", 2000, 190, null, sedi[1], dipendenti[2]]),
    insert("auto", ["targa", "modello_id", "anno", "colore", "km", "prezzo", "prezzo_acquisto", "stato", "alimentazione", "cambio", "cilindrata", "potenza_cv", "cliente_id", "sede_id", "venditore_id"], ["ST345UV", modelli[0], 2023, "Blu", 3000, 12500, 9800, "disponibile", "gpl", "manuale", 1200, 69, null, sedi[0], dipendenti[0]]),
  ]);

  await Promise.all([
    insert("immagini_auto", ["auto_id", "url", "principale"], [auto[0], "https://picsum.photos/seed/car1/600/400", 1]),
    insert("immagini_auto", ["auto_id", "url", "principale"], [auto[1], "https://picsum.photos/seed/car2/600/400", 1]),
    insert("immagini_auto", ["auto_id", "url", "principale"], [auto[2], "https://picsum.photos/seed/car3/600/400", 1]),
  ]);

  const vendite = await Promise.all([
    insert("vendite", ["auto_id", "cliente_id", "venditore_id", "data_vendita", "prezzo_vendita", "sconto", "metodo_pagamento", "stato"], [auto[1], clienti[0], dipendenti[0], "2025-11-05", 15500, 400, "finanziamento", "completata"]),
  ]);

  const noleggi = await Promise.all([
    insert("noleggi", ["auto_id", "cliente_id", "data_inizio", "data_fine", "prezzo_giornaliero", "km_percorsi", "stato"], [auto[2], clienti[1], "2026-07-20", "2026-08-03", 45, 850, "in corso"]),
  ]);

  const tipiManutenzione = await Promise.all([
    insert("tipi_manutenzione", ["nome", "descrizione", "costo_medio"], ["Tagliando", "Manutenzione ordinaria", 180]),
    insert("tipi_manutenzione", ["nome", "descrizione", "costo_medio"], ["Freni", "Sostituzione pastiglie/dischi", 220]),
    insert("tipi_manutenzione", ["nome", "descrizione", "costo_medio"], ["Gomme", "Cambio pneumatici", 350]),
  ]);

  await Promise.all([
    insert("manutenzioni", ["auto_id", "tipo_id", "data", "descrizione", "costo", "km", "officina"], [auto[3], tipiManutenzione[1], "2026-07-10", "Sostituzione pastiglie anteriori", 210, 61000, "Officina Verona Sud"]),
    insert("manutenzioni", ["auto_id", "tipo_id", "data", "descrizione", "costo", "km", "officina"], [auto[0], tipiManutenzione[0], "2026-05-02", "Tagliando 30.000 km", 175, 30000, "Officina Verona Sud"]),
  ]);

  const fornitori = await Promise.all([
    insert("fornitori", ["ragione_sociale", "partita_iva", "telefono", "email", "indirizzo"], ["RicambiVeloci Srl", "IT01234567890", "0459876543", "ordini@ricambiveloci.it", "Via Industria 4, Verona"]),
    insert("fornitori", ["ragione_sociale", "partita_iva", "telefono", "email", "indirizzo"], ["AutoParts Italia", "IT09876543210", "0498765432", "vendite@autopartsitalia.it", "Via Padova 100, Padova"]),
  ]);

  const ricambi = await Promise.all([
    insert("ricambi", ["nome", "codice", "fornitore_id", "prezzo_unitario", "quantita_magazzino", "scorta_minima"], ["Pastiglie freno anteriori", "PF-001", fornitori[0], 45, 24, 5]),
    insert("ricambi", ["nome", "codice", "fornitore_id", "prezzo_unitario", "quantita_magazzino", "scorta_minima"], ["Filtro olio", "FO-002", fornitori[0], 12, 60, 10]),
    insert("ricambi", ["nome", "codice", "fornitore_id", "prezzo_unitario", "quantita_magazzino", "scorta_minima"], ["Pneumatico 195/65 R15", "PN-015", fornitori[1], 78, 16, 4]),
  ]);

  await insert("ordini_ricambi", ["fornitore_id", "data_ordine", "data_consegna", "stato", "totale"], [fornitori[0], "2026-07-28", "2026-08-02", "consegnato", 540]);

  await Promise.all([
    insert("appuntamenti", ["cliente_id", "dipendente_id", "auto_id", "data_ora", "tipo", "note", "stato"], [clienti[2], dipendenti[0], auto[4], "2026-08-14 10:00", "test drive", "Interessato al modello Panda", "programmato"]),
    insert("appuntamenti", ["cliente_id", "dipendente_id", "auto_id", "data_ora", "tipo", "note", "stato"], [clienti[3], dipendenti[2], auto[3], "2026-08-12 15:30", "assistenza", "Ritiro auto post manutenzione", "programmato"]),
  ]);

  await Promise.all([
    insert("documenti", ["auto_id", "cliente_id", "tipo", "nome_file", "url", "data_caricamento"], [auto[1], clienti[0], "contratto", "contratto_vendita_EF456GH.pdf", "", "2025-11-05"]),
    insert("documenti", ["auto_id", "cliente_id", "tipo", "nome_file", "url", "data_caricamento"], [auto[1], clienti[0], "fattura", "fattura_EF456GH.pdf", "", "2025-11-05"]),
  ]);

  await insert("pagamenti", ["vendita_id", "noleggio_id", "importo", "metodo", "data_pagamento", "stato"], [vendite[0], null, 15500, "finanziamento", "2025-11-05", "pagato"]);
  await insert("pagamenti", ["vendita_id", "noleggio_id", "importo", "metodo", "data_pagamento", "stato"], [null, noleggi[0], 630, "carta", "2026-07-20", "pagato"]);

  await insert("assicurazioni", ["auto_id", "compagnia", "numero_polizza", "data_inizio", "data_scadenza", "premio_annuo"], [auto[2], "Generali", "POL-778812", "2026-01-01", "2026-12-31", 480]);

  await insert("revisioni", ["auto_id", "data_revisione", "data_scadenza", "esito", "costo"], [auto[3], "2026-02-15", "2028-02-15", "superata", 65]);

  await insert("contratti", ["vendita_id", "noleggio_id", "numero_contratto", "data_firma", "url_pdf"], [vendite[0], null, "CTR-2025-0114", "2025-11-05", ""]);
  await insert("contratti", ["vendita_id", "noleggio_id", "numero_contratto", "data_firma", "url_pdf"], [null, noleggi[0], "CTR-2026-0087", "2026-07-20", ""]);

  await Promise.all([
    insert("recensioni", ["cliente_id", "auto_id", "valutazione", "commento", "data"], [clienti[0], auto[1], 5, "Servizio ottimo, consegna puntuale.", "2025-11-10"]),
    insert("recensioni", ["cliente_id", "auto_id", "valutazione", "commento", "data"], [clienti[1], auto[2], 4, "Auto in buone condizioni, staff cordiale.", "2026-07-25"]),
  ]);

  await Promise.all([
    insert("promozioni", ["nome", "descrizione", "sconto_percentuale", "data_inizio", "data_fine", "attiva"], ["Estate 2026", "Sconto su tutte le city car", 8, "2026-06-01", "2026-08-31", 1]),
    insert("promozioni", ["nome", "descrizione", "sconto_percentuale", "data_inizio", "data_fine", "attiva"], ["Rottamazione+", "Sconto extra con rottamazione usato", 5, "2026-01-01", "2026-12-31", 1]),
  ]);

  console.log("✅ Seed completato.");
}

module.exports = seed;
