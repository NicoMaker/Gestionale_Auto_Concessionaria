const ITEMS = [
  { route: 'dashboard', icon: '📊', label: 'Dashboard' },
  { route: 'auto', icon: '🚗', label: 'Parco Auto' },
  { route: 'clienti', icon: '👥', label: 'Clienti' },
  { route: 'manutenzioni', icon: '🔧', label: 'Manutenzioni' },
  { route: 'noleggi', icon: '📅', label: 'Noleggi' }
];

export function mountSidebar(currentRoute, onNavigate) {
  const el = document.getElementById('sidebar');
  el.innerHTML = `
    <div class="brand">
      <div class="logo">🚗</div>
      <span>Gestionale Auto</span>
    </div>
    <nav class="nav-group">
      ${ITEMS.map(item => `
        <div class="nav-item ${item.route === currentRoute ? 'active' : ''}" data-route="${item.route}">
          <span class="icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </div>
      `).join('')}
    </nav>
    <div class="sidebar-footer">Gestionale Auto v1.0<br/>Node + Express + SQLite3</div>
  `;

  el.querySelectorAll('.nav-item').forEach(node => {
    node.addEventListener('click', () => onNavigate(node.dataset.route));
  });
}
