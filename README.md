# AutoGest Pro — Gestionale Auto Concessionaria (v2)

Riscrittura completa e modernizzata del gestionale, organizzata **a componenti**
sia lato backend che frontend, con architettura **metadata-driven**: lo schema
di 24 tabelle definito una sola volta genera automaticamente tabelle DB,
API REST, form e tabelle di visualizzazione.

## Struttura

```
backend/                 → API REST Node.js + Express + SQLite
  config/db.js            connessione DB + creazione tabelle dallo schema
  data/schema.js           ⭐ DATI BACKEND: le 24 tabelle e le loro colonne/relazioni
  data/seed.js              dati di esempio
  repositories/            accesso al DB (query parametrizzate)
  controllers/             logica CRUD + validazione + dashboard
  routes/                  registrazione automatica delle rotte per entità
  server.js                entry point

frontend/                → SPA vanilla JS a componenti (nessun framework, nessuna build)
  css/
    variables.css          ⭐ DATI CSS: design tokens (colori, spaziature, font, tema chiaro/scuro)
    reset.css, layout.css, components.css, pages.css, animations.css
  js/
    data/entities.js        ⭐ DATI FRONTEND: icone, gruppi di navigazione, etichette
    api.js                  client REST generico
    state.js                store globale pub/sub
    router.js                router hash-based
    components/             Sidebar, Topbar, Table, Form, Modal, Toast, StatCard
    pages/                   Dashboard, EntityPage (CRUD generico per ogni tabella)
    app.js                   bootstrap dell'applicazione
  index.html
```

## Le 24 tabelle

Anagrafiche: sedi, ruoli, dipendenti, clienti
Catalogo: marche, categorie, modelli, auto, immagini_auto
Vendite & Noleggi: vendite, noleggi
Assistenza: tipi_manutenzione, manutenzioni, revisioni
Magazzino: fornitori, ricambi, ordini_ricambi
Attività: appuntamenti, recensioni, promozioni
Documenti: documenti, pagamenti, assicurazioni, contratti

## Avvio

```bash
cd backend
npm install
npm start        # oppure: npm run dev (con nodemon)
```

Il server avvia su `http://localhost:3000`, serve il frontend (cartella
`frontend/`) come sito statico ed espone le API su `/api/*`.
Al primo avvio crea automaticamente tutte le tabelle e le popola con
dati di esempio realistici.

## Aggiungere una 25ª tabella

Basta aggiungere un nuovo oggetto a `backend/data/schema.js`: tabella,
rotte REST, validazioni, form e pagina di gestione nel frontend vengono
generati automaticamente, senza scrivere altro codice.
