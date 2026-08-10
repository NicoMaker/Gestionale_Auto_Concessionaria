/** Card statistica per la dashboard */
export function renderStatCard({ icon, value, label, variant = "primary" }) {
  const el = document.createElement("div");
  el.className = `stat-card stat-card--${variant}`;
  el.innerHTML = `
    <div class="stat-card__icon">${icon}</div>
    <div class="stat-card__value">${value}</div>
    <div class="stat-card__label">${label}</div>
  `;
  return el;
}
