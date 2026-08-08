import { api } from "../api.js";
import { mountTopbar } from "../components/topbar.js";
import { renderTable, statoBadge } from "../components/table.js";

export async function renderDashboard(container) {
  mountTopbar({
    title: "Dashboard",
    subtitle: "Panoramica generale del gestionale",
  });

  container.innerHTML = `<div id="dash-content" class="text-dim">Caricamento dati…</div>`;

  const [stats, auto] = await Promise.all([api.getStats(), api.getAuto()]);
  const dash = document.getElementById("dash-content");

  const cards = [
    {
      label: "Auto totali",
      value: stats.totale ?? 0,
      icon: "🚗",
      color: "info",
    },
    {
      label: "Disponibili",
      value: stats.disponibili ?? 0,
      icon: "✅",
      color: "success",
    },
    {
      label: "Noleggiate",
      value: stats.noleggiate ?? 0,
      icon: "📅",
      color: "purple",
    },
    {
      label: "In manutenzione",
      value: stats.in_manutenzione ?? 0,
      icon: "🔧",
      color: "warning",
    },
    {
      label: "Clienti registrati",
      value: stats.totale_clienti ?? 0,
      icon: "👥",
      color: "info",
    },
    {
      label: "Valore parco auto",
      value: formatCurrency(stats.valore_totale),
      icon: "💰",
      color: "success",
    },
  ];

  dash.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "stat-grid";
  cards.forEach((c) => grid.appendChild(statCard(c)));
  dash.appendChild(grid);

  const panelHeader = document.createElement("div");
  panelHeader.style.marginBottom = "12px";
  panelHeader.innerHTML = `<h3 style="margin:0 0 12px 0;font-size:1rem;">Ultime auto aggiunte</h3>`;
  dash.appendChild(panelHeader);

  const recent = auto.slice(0, 6);
  const table = renderTable({
    columns: [
      { key: "targa", label: "Targa" },
      { key: "marca", label: "Marca" },
      { key: "modello", label: "Modello" },
      { key: "anno", label: "Anno" },
      { key: "stato", label: "Stato", render: (r) => statoBadge(r.stato) },
      {
        key: "prezzo",
        label: "Prezzo",
        render: (r) => formatCurrency(r.prezzo),
      },
    ],
    rows: recent,
    emptyText:
      'Nessuna auto presente. Aggiungine una dalla sezione "Parco Auto".',
  });
  dash.appendChild(table);
}

function statCard({ label, value, icon, color }) {
  const el = document.createElement("div");
  el.className = "stat-card";
  el.innerHTML = `
    <div class="stat-top">
      <div class="stat-icon badge-${color}" style="background:var(--${color === "info" ? "accent" : color}-soft); color:var(--${color === "info" ? "accent" : color});">${icon}</div>
    </div>
    <div class="stat-value">${value}</div>
    <div class="stat-label">${label}</div>
  `;
  return el;
}

export function formatCurrency(n) {
  const v = Number(n || 0);
  return v.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}
