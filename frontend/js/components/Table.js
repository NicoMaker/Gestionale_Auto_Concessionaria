import { MAX_TABLE_COLUMNS } from "../data/entities.js";

function formatCell(value, col) {
  if (value === null || value === undefined || value === "") return '<span class="text-muted">—</span>';
  if (col?.type === "BOOLEAN") return value ? "Sì" : "No";
  if (col?.type === "REAL" && !isNaN(value)) return `€ ${Number(value).toLocaleString("it-IT", { minimumFractionDigits: 2 })}`;
  if (typeof value === "string" && value.length > 40) return `${value.slice(0, 40)}…`;
  return String(value);
}

function statusBadgeClass(value) {
  const map = {
    disponibile: "success",
    completata: "success",
    consegnato: "success",
    superata: "success",
    pagato: "success",
    programmato: "primary",
    "in corso": "primary",
    spedito: "primary",
    "in attesa": "warning",
    "in trattativa": "warning",
    manutenzione: "warning",
    riservata: "warning",
    venduta: "accent",
    noleggiata: "accent",
    annullata: "danger",
    annullato: "danger",
    "non superata": "danger",
    rimborsato: "danger",
    concluso: "neutral",
  };
  return map[value] || "neutral";
}

/**
 * Renderizza una tabella dati generica dentro `container`.
 * columns: array di metadati colonna (dallo schema backend).
 * rows: array di record.
 * onEdit/onDelete: callback riga.
 */
export function renderTable(container, { columns, rows, onEdit, onDelete }) {
  const visibleColumns = columns.slice(0, MAX_TABLE_COLUMNS);

  if (!rows.length) {
    container.innerHTML = `<div class="data-table__empty">Nessun dato presente. Aggiungi il primo record con il pulsante "Nuovo".</div>`;
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = "table-wrap";

  const table = document.createElement("table");
  table.className = "data-table";

  const thead = document.createElement("thead");
  thead.innerHTML = `<tr>
    <th>#</th>
    ${visibleColumns.map((c) => `<th>${c.name.replace(/_/g, " ")}</th>`).join("")}
    <th></th>
  </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const cells = visibleColumns
      .map((c) => {
        const raw = row[c.name];
        if (c.options && raw) {
          return `<td><span class="badge badge--${statusBadgeClass(raw)}">${raw}</span></td>`;
        }
        return `<td>${formatCell(raw, c)}</td>`;
      })
      .join("");

    tr.innerHTML = `<td class="text-muted">${row.id}</td>${cells}<td></td>`;

    const actionsTd = tr.lastElementChild;
    actionsTd.className = "data-table__actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn--icon";
    editBtn.title = "Modifica";
    editBtn.textContent = "✏️";
    editBtn.onclick = () => onEdit(row);

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn--icon";
    delBtn.title = "Elimina";
    delBtn.textContent = "🗑️";
    delBtn.onclick = () => onDelete(row);

    actionsTd.append(editBtn, delBtn);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrap.appendChild(table);
  container.innerHTML = "";
  container.appendChild(wrap);
}
