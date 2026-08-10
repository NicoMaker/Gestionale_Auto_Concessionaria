/**
 * DATI FRONTEND — JS
 * Metadata di presentazione: arricchisce le entità restituite da
 * /api/meta/entities con icone, colori, ordine dei gruppi e la
 * colonna "display" da usare nelle select di riferimento (FK).
 * La struttura dei campi (tipi, obbligatorietà, opzioni, foreign key)
 * arriva invece dal backend: unica fonte di verità per lo schema.
 */

export const GROUP_ORDER = [
  "Dashboard",
  "Anagrafiche",
  "Catalogo",
  "Vendite & Noleggi",
  "Assistenza",
  "Magazzino",
  "Attività",
  "Documenti",
];

export const GROUP_ICONS = {
  Dashboard: "📊",
  Anagrafiche: "👥",
  Catalogo: "🚘",
  "Vendite & Noleggi": "🤝",
  Assistenza: "🔧",
  Magazzino: "📦",
  Attività: "🗓️",
  Documenti: "📄",
};

export const ENTITY_META = {
  sedi: { icon: "🏢", display: "nome" },
  ruoli: { icon: "🪪", display: "nome" },
  dipendenti: { icon: "🧑‍💼", display: (r) => `${r.nome} ${r.cognome}` },
  clienti: { icon: "👤", display: (r) => `${r.nome} ${r.cognome}` },
  marche: { icon: "🏷️", display: "nome" },
  categorie: { icon: "🗂️", display: "nome" },
  modelli: { icon: "🚗", display: "nome" },
  auto: { icon: "🚙", display: (r) => `${r.targa}` },
  immagini_auto: { icon: "🖼️", display: "url" },
  vendite: { icon: "💰", display: (r) => `Vendita #${r.id}` },
  noleggi: { icon: "🔑", display: (r) => `Noleggio #${r.id}` },
  tipi_manutenzione: { icon: "🛠️", display: "nome" },
  manutenzioni: { icon: "🔧", display: (r) => `Manutenzione #${r.id}` },
  fornitori: { icon: "🏭", display: "ragione_sociale" },
  ricambi: { icon: "⚙️", display: "nome" },
  ordini_ricambi: { icon: "📥", display: (r) => `Ordine #${r.id}` },
  appuntamenti: { icon: "📅", display: (r) => `Appuntamento #${r.id}` },
  documenti: { icon: "📄", display: "nome_file" },
  pagamenti: { icon: "💳", display: (r) => `Pagamento #${r.id}` },
  assicurazioni: { icon: "🛡️", display: "compagnia" },
  revisioni: { icon: "✅", display: (r) => `Revisione #${r.id}` },
  contratti: { icon: "📝", display: "numero_contratto" },
  recensioni: { icon: "⭐", display: (r) => `Recensione #${r.id}` },
  promozioni: { icon: "🎯", display: "nome" },
};

export function getEntityIcon(name) {
  return ENTITY_META[name]?.icon || "📋";
}

export function getDisplayValue(entityName, row) {
  if (!row) return "";
  const display = ENTITY_META[entityName]?.display;
  if (typeof display === "function") return display(row);
  if (typeof display === "string") return row[display] ?? `#${row.id}`;
  return `#${row.id}`;
}

/** Colonne massime mostrate in tabella prima di "created_at" per non affollare la vista */
export const MAX_TABLE_COLUMNS = 6;
