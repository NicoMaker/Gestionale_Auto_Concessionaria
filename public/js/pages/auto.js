import { api } from '../api.js';
import { mountTopbar } from '../components/topbar.js';
import { renderTable, statoBadge, actionButtons } from '../components/table.js';
import { openFormModal, openConfirmModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { formatCurrency } from './dashboard.js';

const STATI = ['disponibile', 'venduta', 'noleggiata', 'manutenzione'];

export async function renderAutoPage(container) {
  let query = '';
  let statoFiltro = '';
  let clienti = [];

  mountTopbar({
    title: 'Parco Auto',
    subtitle: 'Gestisci il tuo inventario di veicoli',
    searchPlaceholder: 'Cerca per targa, marca o modello…',
    onSearch: (v) => { query = v; load(); },
    actionLabel: 'Nuova Auto',
    onAction: () => openAutoForm()
  });

  container.innerHTML = `
    <div class="toolbar">
      <select class="select-filter" id="filtro-stato">
        <option value="">Tutti gli stati</option>
        ${STATI.map(s => `<option value="${s}">${capitalize(s)}</option>`).join('')}
      </select>
      <div class="spacer"></div>
    </div>
    <div id="auto-table"></div>
  `;

  container.querySelector('#filtro-stato').addEventListener('change', (e) => {
    statoFiltro = e.target.value;
    load();
  });

  clienti = await api.getClienti();
  await load();

  async function load() {
    const tableHost = container.querySelector('#auto-table');
    tableHost.innerHTML = '<div class="text-dim">Caricamento…</div>';
    const rows = await api.getAuto({ q: query, stato: statoFiltro });
    tableHost.innerHTML = '';
    tableHost.appendChild(renderTable({
      columns: [
        { key: 'targa', label: 'Targa' },
        { key: 'marca', label: 'Marca' },
        { key: 'modello', label: 'Modello' },
        { key: 'anno', label: 'Anno' },
        { key: 'colore', label: 'Colore' },
        { key: 'km', label: 'Km', render: r => (r.km ?? 0).toLocaleString('it-IT') },
        { key: 'prezzo', label: 'Prezzo', render: r => formatCurrency(r.prezzo) },
        { key: 'stato', label: 'Stato', render: r => statoBadge(r.stato) },
        {
          key: 'proprietario', label: 'Proprietario',
          render: r => r.cliente_nome ? `${r.cliente_nome} ${r.cliente_cognome}` : '<span class="text-dim">—</span>'
        },
        {
          key: 'azioni', label: '',
          render: r => actionButtons({
            onEdit: () => openAutoForm(r),
            onDelete: () => confirmDelete(r)
          })
        }
      ],
      rows,
      emptyIcon: '🚗',
      emptyText: 'Nessuna auto trovata. Aggiungi la prima auto al parco.'
    }));
  }

  function openAutoForm(existing) {
    openFormModal({
      title: existing ? `Modifica ${existing.targa}` : 'Nuova Auto',
      submitLabel: existing ? 'Salva modifiche' : 'Aggiungi auto',
      fields: [
        { name: 'targa', label: 'Targa', required: true, value: existing?.targa },
        { name: 'marca', label: 'Marca', required: true, value: existing?.marca },
        { name: 'modello', label: 'Modello', required: true, value: existing?.modello },
        { name: 'anno', label: 'Anno', type: 'number', value: existing?.anno },
        { name: 'colore', label: 'Colore', value: existing?.colore },
        { name: 'km', label: 'Chilometraggio', type: 'number', value: existing?.km ?? 0 },
        { name: 'prezzo', label: 'Prezzo (€)', type: 'number', step: '0.01', value: existing?.prezzo ?? 0 },
        {
          name: 'stato', label: 'Stato', type: 'select', value: existing?.stato || 'disponibile',
          options: STATI.map(s => ({ value: s, label: capitalize(s) }))
        },
        {
          name: 'cliente_id', label: 'Proprietario / Cliente', type: 'select', value: existing?.cliente_id || '',
          options: [{ value: '', label: '— Nessuno —' }, ...clienti.map(c => ({ value: c.id, label: `${c.nome} ${c.cognome}` }))]
        }
      ],
      onSubmit: async (values) => {
        const payload = {
          ...values,
          anno: values.anno ? Number(values.anno) : null,
          km: Number(values.km || 0),
          prezzo: Number(values.prezzo || 0),
          cliente_id: values.cliente_id || null
        };
        if (existing) {
          await api.updateAuto(existing.id, payload);
          showToast('Auto aggiornata con successo', 'success');
        } else {
          await api.createAuto(payload);
          showToast('Auto aggiunta con successo', 'success');
        }
        await load();
      }
    });
  }

  function confirmDelete(row) {
    openConfirmModal({
      title: 'Elimina auto',
      message: `Vuoi eliminare definitivamente l'auto <b>${row.marca} ${row.modello}</b> (${row.targa})? L'operazione non è reversibile.`,
      confirmLabel: 'Elimina',
      onConfirm: async () => {
        await api.deleteAuto(row.id);
        showToast('Auto eliminata', 'success');
        await load();
      }
    });
  }
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
