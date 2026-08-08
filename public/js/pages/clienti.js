import { api } from '../api.js';
import { mountTopbar } from '../components/topbar.js';
import { renderTable, actionButtons } from '../components/table.js';
import { openFormModal, openConfirmModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

export async function renderClientiPage(container) {
  let query = '';

  mountTopbar({
    title: 'Clienti',
    subtitle: 'Anagrafica clienti del gestionale',
    searchPlaceholder: 'Cerca per nome, cognome o email…',
    onSearch: (v) => { query = v; load(); },
    actionLabel: 'Nuovo Cliente',
    onAction: () => openClienteForm()
  });

  container.innerHTML = `<div id="clienti-table"></div>`;
  await load();

  async function load() {
    const tableHost = container.querySelector('#clienti-table');
    tableHost.innerHTML = '<div class="text-dim">Caricamento…</div>';
    const rows = await api.getClienti({ q: query });
    tableHost.innerHTML = '';
    tableHost.appendChild(renderTable({
      columns: [
        {
          key: 'nome', label: 'Cliente',
          render: r => `<div style="display:flex;align-items:center;gap:10px;">
            <div class="avatar">${initials(r.nome, r.cognome)}</div>
            <div>${r.nome} ${r.cognome}</div>
          </div>`
        },
        { key: 'email', label: 'Email', render: r => r.email || '<span class="text-dim">—</span>' },
        { key: 'telefono', label: 'Telefono', render: r => r.telefono || '<span class="text-dim">—</span>' },
        { key: 'indirizzo', label: 'Indirizzo', render: r => r.indirizzo || '<span class="text-dim">—</span>' },
        {
          key: 'azioni', label: '',
          render: r => actionButtons({
            onEdit: () => openClienteForm(r),
            onDelete: () => confirmDelete(r)
          })
        }
      ],
      rows,
      emptyIcon: '👥',
      emptyText: 'Nessun cliente trovato. Aggiungi il primo cliente.'
    }));
  }

  function openClienteForm(existing) {
    openFormModal({
      title: existing ? `Modifica ${existing.nome} ${existing.cognome}` : 'Nuovo Cliente',
      submitLabel: existing ? 'Salva modifiche' : 'Aggiungi cliente',
      fields: [
        { name: 'nome', label: 'Nome', required: true, value: existing?.nome },
        { name: 'cognome', label: 'Cognome', required: true, value: existing?.cognome },
        { name: 'email', label: 'Email', type: 'email', value: existing?.email },
        { name: 'telefono', label: 'Telefono', value: existing?.telefono },
        { name: 'indirizzo', label: 'Indirizzo', type: 'textarea', value: existing?.indirizzo }
      ],
      onSubmit: async (values) => {
        if (existing) {
          await api.updateCliente(existing.id, values);
          showToast('Cliente aggiornato con successo', 'success');
        } else {
          await api.createCliente(values);
          showToast('Cliente aggiunto con successo', 'success');
        }
        await load();
      }
    });
  }

  function confirmDelete(row) {
    openConfirmModal({
      title: 'Elimina cliente',
      message: `Vuoi eliminare <b>${row.nome} ${row.cognome}</b> dall'anagrafica? L'operazione non è reversibile.`,
      confirmLabel: 'Elimina',
      onConfirm: async () => {
        await api.deleteCliente(row.id);
        showToast('Cliente eliminato', 'success');
        await load();
      }
    });
  }
}

function initials(nome, cognome) {
  return `${(nome || '?')[0]}${(cognome || '?')[0]}`.toUpperCase();
}
