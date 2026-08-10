import { api } from "./api.js";
import { store } from "./state.js";
import { router } from "./router.js";
import { renderSidebar } from "./components/Sidebar.js";
import { renderTopbar } from "./components/Topbar.js";
import { renderDashboard } from "./pages/Dashboard.js";
import { renderEntityPage } from "./pages/EntityPage.js";
import { showToast } from "./components/Toast.js";

async function bootstrap() {
  const appEl = document.getElementById("app");
  const sidebarEl = document.getElementById("sidebar");
  const topbarEl = document.getElementById("topbar");
  const mainEl = document.getElementById("main");

  try {
    const entities = await api.getEntities();
    store.set({ entities });
  } catch (err) {
    mainEl.innerHTML = `<div class="empty-state">Impossibile contattare il server: ${err.message}</div>`;
    return;
  }

  const sidebar = renderSidebar(sidebarEl, store.state.entities);
  const topbar = renderTopbar(topbarEl);

  // Tema
  document.documentElement.setAttribute("data-theme", store.state.theme);
  store.subscribe((state) => {
    document.documentElement.setAttribute("data-theme", state.theme);
    localStorage.setItem("theme", state.theme);
    appEl.classList.toggle("sidebar-collapsed", state.sidebarCollapsed);
  });

  const entityLabel = (name) => store.getEntity(name)?.label || "Dashboard";

  router
    .register("/dashboard", async (path) => {
      sidebar.setActive(path);
      topbar.setTitle("Dashboard");
      try {
        await renderDashboard(mainEl);
      } catch (err) {
        showToast("Errore nel caricamento della dashboard.", "error");
      }
    })
    .start();

  // Registra dinamicamente una rotta per ciascuna entità
  store.state.entities.forEach((entity) => {
    router.register(`/${entity.name}`, async (path) => {
      sidebar.setActive(path);
      topbar.setTitle(entityLabel(entity.name));
      try {
        await renderEntityPage(mainEl, entity.name);
      } catch (err) {
        showToast(`Errore nel caricamento di ${entity.label}.`, "error");
      }
    });
  });

  router.resolve();
}

bootstrap();
