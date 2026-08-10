/**
 * DATI BACKEND — Schema dell'intero gestionale.
 * ---------------------------------------------------------------
 * Ogni entità definita qui genera automaticamente:
 *  - la tabella SQLite (con relazioni e vincoli)
 *  - le rotte REST CRUD  (/api/<entity>)
 *  - la validazione dei campi obbligatori
 *
 * Aggiungere una nuova tabella = aggiungere un nuovo oggetto
 * a questo array. Nessun'altra modifica al backend è necessaria.
 * ---------------------------------------------------------------
 * Tipi colonna supportati: TEXT | INTEGER | REAL | BOOLEAN | DATE | DATETIME
 */

const SCHEMA = [
  {
    name: "sedi",
    label: "Sedi",
    group: "Anagrafiche",
    columns: [
      { name: "nome", type: "TEXT", required: true },
      { name: "indirizzo", type: "TEXT", required: true },
      { name: "citta", type: "TEXT", required: true },
      { name: "cap", type: "TEXT" },
      { name: "telefono", type: "TEXT" },
      { name: "email", type: "TEXT" },
    ],
  },
  {
    name: "ruoli",
    label: "Ruoli",
    group: "Anagrafiche",
    columns: [
      { name: "nome", type: "TEXT", required: true, unique: true },
      { name: "descrizione", type: "TEXT" },
    ],
  },
  {
    name: "dipendenti",
    label: "Dipendenti",
    group: "Anagrafiche",
    columns: [
      { name: "nome", type: "TEXT", required: true },
      { name: "cognome", type: "TEXT", required: true },
      { name: "email", type: "TEXT" },
      { name: "telefono", type: "TEXT" },
      { name: "ruolo_id", type: "INTEGER", fk: { table: "ruoli" } },
      { name: "sede_id", type: "INTEGER", fk: { table: "sedi" } },
      { name: "data_assunzione", type: "DATE" },
      { name: "stipendio", type: "REAL" },
      { name: "attivo", type: "BOOLEAN", default: 1 },
    ],
  },
  {
    name: "clienti",
    label: "Clienti",
    group: "Anagrafiche",
    columns: [
      { name: "nome", type: "TEXT", required: true },
      { name: "cognome", type: "TEXT", required: true },
      { name: "email", type: "TEXT" },
      { name: "telefono", type: "TEXT" },
      { name: "indirizzo", type: "TEXT" },
      { name: "citta", type: "TEXT" },
      { name: "cap", type: "TEXT" },
      { name: "codice_fiscale", type: "TEXT" },
      { name: "data_nascita", type: "DATE" },
      { name: "note", type: "TEXT" },
    ],
  },
  {
    name: "marche",
    label: "Marche",
    group: "Catalogo",
    columns: [
      { name: "nome", type: "TEXT", required: true, unique: true },
      { name: "paese_origine", type: "TEXT" },
      { name: "logo_url", type: "TEXT" },
    ],
  },
  {
    name: "categorie",
    label: "Categorie auto",
    group: "Catalogo",
    columns: [
      { name: "nome", type: "TEXT", required: true, unique: true },
      { name: "descrizione", type: "TEXT" },
    ],
  },
  {
    name: "modelli",
    label: "Modelli",
    group: "Catalogo",
    columns: [
      { name: "marca_id", type: "INTEGER", required: true, fk: { table: "marche" } },
      { name: "categoria_id", type: "INTEGER", fk: { table: "categorie" } },
      { name: "nome", type: "TEXT", required: true },
      { name: "anno_inizio_produzione", type: "INTEGER" },
    ],
  },
  {
    name: "auto",
    label: "Veicoli",
    group: "Catalogo",
    columns: [
      { name: "targa", type: "TEXT", required: true, unique: true },
      { name: "modello_id", type: "INTEGER", required: true, fk: { table: "modelli" } },
      { name: "anno", type: "INTEGER" },
      { name: "colore", type: "TEXT" },
      { name: "km", type: "INTEGER", default: 0 },
      { name: "prezzo", type: "REAL", default: 0 },
      { name: "prezzo_acquisto", type: "REAL" },
      {
        name: "stato",
        type: "TEXT",
        required: true,
        default: "'disponibile'",
        options: ["disponibile", "venduta", "noleggiata", "manutenzione", "riservata"],
      },
      { name: "alimentazione", type: "TEXT", options: ["benzina", "diesel", "ibrida", "elettrica", "gpl", "metano"] },
      { name: "cambio", type: "TEXT", options: ["manuale", "automatico"] },
      { name: "cilindrata", type: "INTEGER" },
      { name: "potenza_cv", type: "INTEGER" },
      { name: "cliente_id", type: "INTEGER", fk: { table: "clienti", onDelete: "SET NULL" } },
      { name: "sede_id", type: "INTEGER", fk: { table: "sedi", onDelete: "SET NULL" } },
      { name: "venditore_id", type: "INTEGER", fk: { table: "dipendenti", onDelete: "SET NULL" } },
    ],
  },
  {
    name: "immagini_auto",
    label: "Immagini veicoli",
    group: "Catalogo",
    columns: [
      { name: "auto_id", type: "INTEGER", required: true, fk: { table: "auto", onDelete: "CASCADE" } },
      { name: "url", type: "TEXT", required: true },
      { name: "principale", type: "BOOLEAN", default: 0 },
    ],
  },
  {
    name: "vendite",
    label: "Vendite",
    group: "Vendite & Noleggi",
    columns: [
      { name: "auto_id", type: "INTEGER", required: true, fk: { table: "auto", onDelete: "CASCADE" } },
      { name: "cliente_id", type: "INTEGER", required: true, fk: { table: "clienti", onDelete: "CASCADE" } },
      { name: "venditore_id", type: "INTEGER", fk: { table: "dipendenti", onDelete: "SET NULL" } },
      { name: "data_vendita", type: "DATE", required: true },
      { name: "prezzo_vendita", type: "REAL", required: true },
      { name: "sconto", type: "REAL", default: 0 },
      { name: "metodo_pagamento", type: "TEXT", options: ["contanti", "bonifico", "finanziamento", "carta"] },
      { name: "stato", type: "TEXT", default: "'completata'", options: ["in trattativa", "completata", "annullata"] },
    ],
  },
  {
    name: "noleggi",
    label: "Noleggi",
    group: "Vendite & Noleggi",
    columns: [
      { name: "auto_id", type: "INTEGER", required: true, fk: { table: "auto", onDelete: "CASCADE" } },
      { name: "cliente_id", type: "INTEGER", required: true, fk: { table: "clienti", onDelete: "CASCADE" } },
      { name: "data_inizio", type: "DATE", required: true },
      { name: "data_fine", type: "DATE" },
      { name: "prezzo_giornaliero", type: "REAL", default: 0 },
      { name: "km_percorsi", type: "INTEGER", default: 0 },
      { name: "stato", type: "TEXT", default: "'in corso'", options: ["in corso", "concluso", "annullato"] },
    ],
  },
  {
    name: "tipi_manutenzione",
    label: "Tipi manutenzione",
    group: "Assistenza",
    columns: [
      { name: "nome", type: "TEXT", required: true, unique: true },
      { name: "descrizione", type: "TEXT" },
      { name: "costo_medio", type: "REAL" },
    ],
  },
  {
    name: "manutenzioni",
    label: "Manutenzioni",
    group: "Assistenza",
    columns: [
      { name: "auto_id", type: "INTEGER", required: true, fk: { table: "auto", onDelete: "CASCADE" } },
      { name: "tipo_id", type: "INTEGER", fk: { table: "tipi_manutenzione" } },
      { name: "data", type: "DATE", required: true },
      { name: "descrizione", type: "TEXT" },
      { name: "costo", type: "REAL", default: 0 },
      { name: "km", type: "INTEGER" },
      { name: "officina", type: "TEXT" },
    ],
  },
  {
    name: "fornitori",
    label: "Fornitori",
    group: "Magazzino",
    columns: [
      { name: "ragione_sociale", type: "TEXT", required: true },
      { name: "partita_iva", type: "TEXT" },
      { name: "telefono", type: "TEXT" },
      { name: "email", type: "TEXT" },
      { name: "indirizzo", type: "TEXT" },
    ],
  },
  {
    name: "ricambi",
    label: "Ricambi",
    group: "Magazzino",
    columns: [
      { name: "nome", type: "TEXT", required: true },
      { name: "codice", type: "TEXT", unique: true },
      { name: "fornitore_id", type: "INTEGER", fk: { table: "fornitori", onDelete: "SET NULL" } },
      { name: "prezzo_unitario", type: "REAL", default: 0 },
      { name: "quantita_magazzino", type: "INTEGER", default: 0 },
      { name: "scorta_minima", type: "INTEGER", default: 0 },
    ],
  },
  {
    name: "ordini_ricambi",
    label: "Ordini ricambi",
    group: "Magazzino",
    columns: [
      { name: "fornitore_id", type: "INTEGER", required: true, fk: { table: "fornitori", onDelete: "CASCADE" } },
      { name: "data_ordine", type: "DATE", required: true },
      { name: "data_consegna", type: "DATE" },
      { name: "stato", type: "TEXT", default: "'in attesa'", options: ["in attesa", "spedito", "consegnato", "annullato"] },
      { name: "totale", type: "REAL", default: 0 },
    ],
  },
  {
    name: "appuntamenti",
    label: "Appuntamenti",
    group: "Attività",
    columns: [
      { name: "cliente_id", type: "INTEGER", required: true, fk: { table: "clienti", onDelete: "CASCADE" } },
      { name: "dipendente_id", type: "INTEGER", fk: { table: "dipendenti", onDelete: "SET NULL" } },
      { name: "auto_id", type: "INTEGER", fk: { table: "auto", onDelete: "SET NULL" } },
      { name: "data_ora", type: "DATETIME", required: true },
      { name: "tipo", type: "TEXT", options: ["test drive", "consulenza", "consegna", "assistenza"] },
      { name: "note", type: "TEXT" },
      { name: "stato", type: "TEXT", default: "'programmato'", options: ["programmato", "completato", "annullato"] },
    ],
  },
  {
    name: "documenti",
    label: "Documenti",
    group: "Documenti",
    columns: [
      { name: "auto_id", type: "INTEGER", fk: { table: "auto", onDelete: "CASCADE" } },
      { name: "cliente_id", type: "INTEGER", fk: { table: "clienti", onDelete: "CASCADE" } },
      { name: "tipo", type: "TEXT", options: ["libretto", "fattura", "contratto", "assicurazione", "altro"] },
      { name: "nome_file", type: "TEXT", required: true },
      { name: "url", type: "TEXT" },
      { name: "data_caricamento", type: "DATE" },
    ],
  },
  {
    name: "pagamenti",
    label: "Pagamenti",
    group: "Documenti",
    columns: [
      { name: "vendita_id", type: "INTEGER", fk: { table: "vendite", onDelete: "CASCADE" } },
      { name: "noleggio_id", type: "INTEGER", fk: { table: "noleggi", onDelete: "CASCADE" } },
      { name: "importo", type: "REAL", required: true },
      { name: "metodo", type: "TEXT", options: ["contanti", "bonifico", "finanziamento", "carta"] },
      { name: "data_pagamento", type: "DATE", required: true },
      { name: "stato", type: "TEXT", default: "'pagato'", options: ["in attesa", "pagato", "rimborsato"] },
    ],
  },
  {
    name: "assicurazioni",
    label: "Assicurazioni",
    group: "Documenti",
    columns: [
      { name: "auto_id", type: "INTEGER", required: true, fk: { table: "auto", onDelete: "CASCADE" } },
      { name: "compagnia", type: "TEXT", required: true },
      { name: "numero_polizza", type: "TEXT" },
      { name: "data_inizio", type: "DATE" },
      { name: "data_scadenza", type: "DATE" },
      { name: "premio_annuo", type: "REAL" },
    ],
  },
  {
    name: "revisioni",
    label: "Revisioni",
    group: "Assistenza",
    columns: [
      { name: "auto_id", type: "INTEGER", required: true, fk: { table: "auto", onDelete: "CASCADE" } },
      { name: "data_revisione", type: "DATE", required: true },
      { name: "data_scadenza", type: "DATE" },
      { name: "esito", type: "TEXT", options: ["superata", "non superata"] },
      { name: "costo", type: "REAL" },
    ],
  },
  {
    name: "contratti",
    label: "Contratti",
    group: "Documenti",
    columns: [
      { name: "vendita_id", type: "INTEGER", fk: { table: "vendite", onDelete: "CASCADE" } },
      { name: "noleggio_id", type: "INTEGER", fk: { table: "noleggi", onDelete: "CASCADE" } },
      { name: "numero_contratto", type: "TEXT", required: true, unique: true },
      { name: "data_firma", type: "DATE" },
      { name: "url_pdf", type: "TEXT" },
    ],
  },
  {
    name: "recensioni",
    label: "Recensioni",
    group: "Attività",
    columns: [
      { name: "cliente_id", type: "INTEGER", required: true, fk: { table: "clienti", onDelete: "CASCADE" } },
      { name: "auto_id", type: "INTEGER", fk: { table: "auto", onDelete: "SET NULL" } },
      { name: "valutazione", type: "INTEGER", required: true },
      { name: "commento", type: "TEXT" },
      { name: "data", type: "DATE" },
    ],
  },
  {
    name: "promozioni",
    label: "Promozioni",
    group: "Attività",
    columns: [
      { name: "nome", type: "TEXT", required: true },
      { name: "descrizione", type: "TEXT" },
      { name: "sconto_percentuale", type: "REAL" },
      { name: "data_inizio", type: "DATE" },
      { name: "data_fine", type: "DATE" },
      { name: "attiva", type: "BOOLEAN", default: 1 },
    ],
  },
];

module.exports = SCHEMA;
