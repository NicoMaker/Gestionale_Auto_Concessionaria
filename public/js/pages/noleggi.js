import { api } from '../api.js';
import { mountTopbar } from '../components/topbar.js';
import { renderTable, statoBadge, actionButtons } from '../components/table.js';
import { openFormModal, openConfirmModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { formatCurrency } from './dashboard.js';

const STATI = ['in corso', 'concluso', 'annullato'];

export async function renderNoleggiPage(container) {
  let autoList = [];
  let clienti = [];

  mountTopbar({
    title: 'Noleggi',
    subtitle: 'Gestisci i contratti di noleggio attivi e conclusi',
    actionLabel: 'Nuovo Noleggio',
    onAction: () => openForm()
  });

  container.innerHTML = `<div id="noleggi-table"></div>`;

  [autoList, clienti] = await Promise.all([api.getAuto(), api.getClienti()]);
  await load();

  async function load() {
    const tableHost = container.querySelector('#noleggi-table');
    tableHost.innerHTML = '<div class="text-dim">Caricamento…</div>';
    const rows = await api.getNoleggi();
    tableHost.innerHTML = '';
    tableHost.appendChild(renderTable({
      columns: [
        { key: 'auto', label: 'Auto', render: r => `${r.marca} ${r.modello} <span class="text-dim">(${r.targa})</span>` },
        { key: 'cliente', label: 'Cliente', render: r => `${r.cliente_nome} ${r.cliente_cognome}` },
        { key: 'data_inizio', label: 'Inizio' },
        { key: 'data_fine', label: 'Fine', render: r => r.data_fine || '<span class="text-dim">—</span>' },
        { key: 'prezzo_giornaliero', label: '€ / giorno', render: r => formatCurrency(r.prezzo_giornaliero) },
        { key: 'stato', label: 'Stato', render: r => statoBadge(r.stato) },
        {
          key: 'azioni', label: '',
          render: r => actionButtons({
            onEdit: () => openForm(r),
            onDelete: () => confirmDelete(r)
          })
        }
      ],
      rows,
      emptyIcon: '📅',
      emptyText: 'Nessun noleggio registrato. Crea il primo contratto.'
    }));
  }

  function openForm(existing) {
    if (autoList.length === 0 || clienti.length === 0) {
      showToast('Servono almeno un\'auto e un cliente per creare un noleggio', 'error');
      return;
    }
    openFormModal({
      title: existing ? 'Modifica Noleggio' : 'Nuovo Noleggio',
      submitLabel: existing ? 'Salva modifiche' : 'Crea noleggio',
      fields: [
        {
          name: 'auto_id', label: 'Auto', type: 'select', required: true, value: existing?.auto_id,
          options: autoList.map(a => ({ value: a.id, label: `${a.marca} ${a.modello} (${a.targa})` }))
        },
        {
          name: 'cliente_id', label: 'Cliente', type: 'select', required: true, value: existing?.cliente_id,
          options: clienti.map(c => ({ value: c.id, label: `${c.nome} ${c.cognome}` }))
        },
        { name: 'data_inizio', label: 'Data inizio', type: 'date', required: true, value: existing?.data_inizio || todayISO() },
        { name: 'data_fine', label: 'Data fine (opzionale)', type: 'date', value: existing?.data_fine },
        { name: 'prezzo_giornaliero', label: 'Prezzo giornaliero (€)', type: 'number', step: '0.01', value: existing?.prezzo_giornaliero ?? 0 },
        {
          name: 'stato', label: 'Stato', type: 'select', value: existing?.stato || 'in corso',
          options: STATI.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))
        }
      ],
      onSubmit: async (values) => {
        const payload = {
          ...values,
          auto_id: Number(values.auto_id),
          cliente_id: Number(values.cliente_id),
          prezzo_giornaliero: Number(values.prezzo_giornaliero || 0),
          data_fine: values.data_fine || null
        };
        if (existing) {
          await api.updateNoleggio(existing.id, payload);
          showToast('Noleggio aggiornato', 'success');
        } else {
          await api.createNoleggio(payload);
          showToast('Noleggio creato', 'success');
        }
        await load();
      }
    });
  }

  function confirmDelete(row) {
    openConfirmModal({
      title: 'Elimina noleggio',
      message: `Vuoi eliminare il noleggio di <b>${row.marca} ${row.modello}</b> per ${row.cliente_nome} ${row.cliente_cognome}?`,
      confirmLabel: 'Elimina',
      onConfirm: async () => {
        await api.deleteNoleggio(row.id);
        showToast('Noleggio eliminato', 'success');
        await load();
      }
    });
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
