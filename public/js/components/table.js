// Componente tabella generico.
// columns: [{ key, label, render? }]
// rows: array di oggetti
// emptyText: testo se non ci sono righe
export function renderTable({
  columns,
  rows,
  emptyText = "Nessun dato disponibile",
  emptyIcon = "📭",
}) {
  const wrap = document.createElement("div");
  wrap.className = "panel";

  if (!rows || rows.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="icon">${emptyIcon}</div>
        <div>${emptyText}</div>
      </div>`;
    return wrap;
  }

  const tableWrap = document.createElement("div");
  tableWrap.className = "table-wrap";

  const table = document.createElement("table");
  table.className = "data-table";

  const thead = document.createElement("thead");
  thead.innerHTML = `<tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr>`;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    columns.forEach((col) => {
      const td = document.createElement("td");
      const content = col.render ? col.render(row) : (row[col.key] ?? "—");
      if (content instanceof Node) td.appendChild(content);
      else td.innerHTML = content;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  tableWrap.appendChild(table);
  wrap.appendChild(tableWrap);
  return wrap;
}

export function statoBadge(stato) {
  const map = {
    disponibile: "success",
    venduta: "info",
    noleggiata: "purple",
    manutenzione: "warning",
    "in corso": "purple",
    concluso: "success",
    annullato: "danger",
  };
  const cls = map[stato] || "info";
  return `<span class="badge badge-${cls}"><span class="badge-dot"></span>${capitalize(stato)}</span>`;
}

export function actionButtons({ onEdit, onDelete }) {
  const wrap = document.createElement("div");
  wrap.className = "table-actions";

  if (onEdit) {
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-secondary btn-sm";
    editBtn.textContent = "Modifica";
    editBtn.addEventListener("click", onEdit);
    wrap.appendChild(editBtn);
  }
  if (onDelete) {
    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-danger btn-sm";
    delBtn.textContent = "Elimina";
    delBtn.addEventListener("click", onDelete);
    wrap.appendChild(delBtn);
  }
  return wrap;
}

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
