import { mountSidebar } from './components/sidebar.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderAutoPage } from './pages/auto.js';
import { renderClientiPage } from './pages/clienti.js';
import { renderManutenzioniPage } from './pages/manutenzioni.js';
import { renderNoleggiPage } from './pages/noleggi.js';
import { showToast } from './components/toast.js';

const PAGES = {
  dashboard: renderDashboard,
  auto: renderAutoPage,
  clienti: renderClientiPage,
  manutenzioni: renderManutenzioniPage,
  noleggi: renderNoleggiPage
};

const content = document.getElementById('content');

function currentRoute() {
  const hash = window.location.hash.replace('#/', '');
  return PAGES[hash] ? hash : 'dashboard';
}

async function navigate(route) {
  window.location.hash = `#/${route}`;
  mountSidebar(route, navigate);
  try {
    await PAGES[route](content);
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Errore durante il caricamento della pagina', 'error');
  }
}

window.addEventListener('hashchange', () => navigate(currentRoute()));

navigate(currentRoute());
