import { api } from "../api.js";
import { renderStatCard } from "../components/StatCard.js";

function renderBarChart(rows) {
  if (!rows.length) return '<div class="empty-state">Nessuna vendita registrata.</div>';
  const max = Math.max(...rows.map((r) => r.totale), 1);
  return `
    <div class="bar-chart">
      ${rows
        .map((r) => {
          const h = Math.max(6, Math.round((r.totale / max) * 160));
          return `
          <div class="bar-chart__col">
            <div class="bar-chart__value">€${Math.round(r.totale / 1000)}k</div>
            <div class="bar-chart__bar" style="height:${h}px"></div>
            <div class="bar-chart__label">${r.mese?.slice(5) || "-"}/${r.mese?.slice(2, 4) || ""}</div>
          </div>`;
        })
        .join("")}
    </div>`;
}

function renderMiniList(rows, totalKey, labelKey) {
  if (!rows.length) return '<div class="empty-state">Nessun dato disponibile.</div>';
  const max = Math.max(...rows.map((r) => r[totalKey]), 1);
  return `
    <div class="mini-list">
      ${rows
        .map(
          (r) => `
        <div class="mini-list__row">
          <span>${r[labelKey]}</span>
          <div class="mini-list__bar-track"><div class="mini-list__bar-fill" style="width:${(r[totalKey] / max) * 100}%"></div></div>
          <strong>${r[totalKey]}</strong>
        </div>`,
        )
        .join("")}
    </div>`;
}

export async function renderDashboard(container) {
  container.innerHTML = '<div class="spinner"></div>';
  const stats = await api.getDashboardStats();

  container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-header__title">Dashboard</div>
        <div class="page-header__subtitle">Panoramica generale della concessionaria</div>
      </div>
    </div>

    <div class="stats-grid" data-stats></div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card__header"><div class="card__title">Fatturato vendite (ultimi mesi)</div></div>
        ${renderBarChart(stats.venditeUltimiMesi)}
      </div>
      <div class="card">
        <div class="card__header"><div class="card__title">Auto per marca</div></div>
        ${renderMiniList(stats.topMarche, "n", "marca")}
      </div>
    </div>
  `;

  const statsGrid = container.querySelector("[data-stats]");
  [
    { icon: "🚙", value: stats.autoTotali, label: "Veicoli totali", variant: "primary" },
    { icon: "✅", value: stats.autoDisponibili, label: "Veicoli disponibili", variant: "success" },
    { icon: "👥", value: stats.clientiTotali, label: "Clienti registrati", variant: "accent" },
    { icon: "💰", value: `€ ${Number(stats.fatturatoVendite).toLocaleString("it-IT")}`, label: "Fatturato vendite", variant: "success" },
    { icon: "🔑", value: stats.noleggiAttivi, label: "Noleggi attivi", variant: "primary" },
    { icon: "🔧", value: stats.manutenzioniUltimi30gg, label: "Manutenzioni (30gg)", variant: "warning" },
    { icon: "📦", value: stats.scorteSottoSoglia, label: "Ricambi sotto scorta", variant: "danger" },
  ].forEach((cfg) => statsGrid.appendChild(renderStatCard(cfg)));
}
