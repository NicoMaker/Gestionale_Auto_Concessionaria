import { api } from "../api.js";
import { store } from "../state.js";
import { renderTable } from "../components/Table.js";
import { buildForm } from "../components/Form.js";
import { openModal, confirmDialog } from "../components/Modal.js";
import { showToast } from "../components/Toast.js";

const PAGE_SIZE = 10;

export async function renderEntityPage(container, entityName) {
  const entity = store.getEntity(entityName);
  if (!entity) {
    container.innerHTML = `<div class="empty-state">Entità non trovata.</div>`;
    return;
  }

  let page = 0;
  let search = "";

  container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-header__title">${entity.label}</div>
        <div class="page-header__subtitle">Gestione anagrafica "${entity.label.toLowerCase()}"</div>
      </div>
      <button class="btn btn--primary" data-new>+ Nuovo</button>
    </div>

    <div class="card">
      <div class="entity-toolbar">
        <div class="entity-toolbar__search">
          <span class="entity-toolbar__search-icon">🔍</span>
          <input type="text" placeholder="Cerca in ${entity.label.toLowerCase()}..." data-search />
        </div>
      </div>
      <div data-table-container><div class="spinner"></div></div>
      <div class="pagination">
        <div class="pagination__info" data-page-info></div>
        <div class="pagination__controls">
          <button class="btn btn--ghost btn--sm" data-prev>← Precedente</button>
          <button class="btn btn--ghost btn--sm" data-next>Successiva →</button>
        </div>
      </div>
    </div>
  `;

  const tableContainer = container.querySelector("[data-table-container]");
  const pageInfo = container.querySelector("[data-page-info]");

  async function load() {
    tableContainer.innerHTML = '<div class="spinner"></div>';
    const res = await api.list(entityName, { search, limit: PAGE_SIZE, offset: page * PAGE_SIZE });
    renderTable(tableContainer, {
      columns: entity.columns,
      rows: res.data,
      onEdit: (row) => openForm(row),
      onDelete: (row) => handleDelete(row),
    });
    const totalPages = Math.max(1, Math.ceil(res.total / PAGE_SIZE));
    pageInfo.textContent = `Pagina ${page + 1} di ${totalPages} · ${res.total} record`;
  }

  async function openForm(row) {
    const isEdit = Boolean(row);
    const { el, getValues } = await buildForm(entity, row || {});
    openModal({
      title: isEdit ? `Modifica ${entity.label.slice(0, -1) || entity.label}` : `Nuovo record — ${entity.label}`,
      bodyEl: el,
      confirmLabel: isEdit ? "Salva modifiche" : "Crea",
      onConfirm: async () => {
        try {
          const values = getValues();
          if (isEdit) {
            await api.update(entityName, row.id, values);
            showToast("Record aggiornato con successo.", "success");
          } else {
            await api.create(entityName, values);
            showToast("Record creato con successo.", "success");
          }
          await load();
        } catch (err) {
          showToast(err.message, "error");
          return false;
        }
      },
    });
  }

  async function handleDelete(row) {
    const ok = await confirmDialog(`Eliminare definitivamente il record #${row.id}?`);
    if (!ok) return;
    try {
      await api.remove(entityName, row.id);
      showToast("Record eliminato.", "success");
      await load();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  container.querySelector("[data-new]").onclick = () => openForm(null);
  container.querySelector("[data-prev]").onclick = () => {
    if (page > 0) {
      page -= 1;
      load();
    }
  };
  container.querySelector("[data-next]").onclick = () => {
    page += 1;
    load();
  };

  let debounceTimer;
  container.querySelector("[data-search]").addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      search = e.target.value;
      page = 0;
      load();
    }, 300);
  });

  await load();
}
