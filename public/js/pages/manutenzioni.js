import { api } from '../api.js';
import { mountTopbar } from '../components/topbar.js';
import { renderTable, actionButtons } from '../components/table.js';
import { openFormModal, openConfirmModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { formatCurrency } from './dashboard.js';

const TIPI = ['Tagliando', 'Cambio gomme', 'Freni', 'Revisione', 'Carrozzeria', 'Altro'];

export async function renderManutenzioniPage(container) {
  let autoList = [];

  mountTopbar({
    title: 'Manutenzioni',
    subtitle: 'Storico interventi sulle auto del parco',
    actionLabel: 'Nuovo Intervento',
    onAction: () => openForm()
  });

  container.innerHTML = `<div id="manut-table"></div>`;

  autoList = await api.getAuto();
  await load();

  async function load() {
    const tableHost = container.querySelector('#manut-table');
    tableHost.innerHTML = '<div class="text-dim">Caricamento…</div>';
    const rows = await api.getManutenzioni();
    tableHost.innerHTML = '';
    tableHost.appendChild(renderTable({
      columns: [
        { key: 'data', label: 'Data' },
        { key: 'auto', label: 'Auto', render: r => `${r.marca} ${r.modello} <span class="text-dim">(${r.targa})</span>` },
        { key: 'tipo', label: 'Tipo', render: r => `<span class="badge badge-info">${r.tipo}</span>` },
        { key: 'descrizione', label: 'Descrizione', render: r => r.descrizione || '<span class="text-dim">—</span>' },
        { key: 'km', label: 'Km', render: r => r.km ? r.km.toLocaleString('it-IT') : '<span class="text-dim">—</span>' },
        { key: 'costo', label: 'Costo', render: r => formatCurrency(r.costo) },
        {
          key: 'azioni', label: '',
          render: r => actionButtons({
            onEdit: () => openForm(r),
            onDelete: () => confirmDelete(r)
          })
        }
      ],
      rows,
      emptyIcon: '🔧',
      emptyText: 'Nessun intervento registrato. Aggiungi la prima manutenzione.'
    }));
  }

  function openForm(existing) {
    if (autoList.length === 0) {
      showToast('Aggiungi prima almeno un\'auto al parco', 'error');
      return;
    }
    openFormModal({
      title: existing ? 'Modifica Intervento' : 'Nuovo Intervento',
      submitLabel: existing ? 'Salva modifiche' : 'Registra intervento',
      fields: [
        {
          name: 'auto_id', label: 'Auto', type: 'select', required: true, value: existing?.auto_id,
          options: autoList.map(a => ({ value: a.id, label: `${a.marca} ${a.modello} (${a.targa})` }))
        },
        { name: 'data', label: 'Data', type: 'date', required: true, value: existing?.data || todayISO() },
        {
          name: 'tipo', label: 'Tipo intervento', type: 'select', required: true, value: existing?.tipo || TIPI[0],
          options: TIPI.map(t => ({ value: t, label: t }))
        },
        { name: 'descrizione', label: 'Descrizione', type: 'textarea', value: existing?.descrizione },
        { name: 'km', label: 'Km al momento dell\'intervento', type: 'number', value: existing?.km },
        { name: 'costo', label: 'Costo (€)', type: 'number', step: '0.01', value: existing?.costo ?? 0 }
      ],
      onSubmit: async (values) => {
        const payload = {
          ...values,
          auto_id: Number(values.auto_id),
          km: values.km ? Number(values.km) : null,
          costo: Number(values.costo || 0)
        };
        if (existing) {
          await api.updateManutenzione(existing.id, payload);
          showToast('Intervento aggiornato', 'success');
        } else {
          await api.createManutenzione(payload);
          showToast('Intervento registrato', 'success');
        }
        await load();
      }
    });
  }

  function confirmDelete(row) {
    openConfirmModal({
      title: 'Elimina intervento',
      message: `Vuoi eliminare l'intervento di <b>${row.tipo}</b> su ${row.marca} ${row.modello}?`,
      confirmLabel: 'Elimina',
      onConfirm: async () => {
        await api.deleteManutenzione(row.id);
        showToast('Intervento eliminato', 'success');
        await load();
      }
    });
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
