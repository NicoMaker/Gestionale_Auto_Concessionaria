import { store } from "../state.js";

export function renderTopbar(container) {
  container.innerHTML = `
    <div class="topbar__left">
      <button class="btn btn--icon" data-toggle-sidebar title="Comprimi menu">☰</button>
      <div class="topbar__title" data-page-title>Dashboard</div>
    </div>
    <div class="topbar__right">
      <button class="btn btn--icon" data-toggle-theme title="Cambia tema">🌓</button>
    </div>
  `;

  container.querySelector("[data-toggle-sidebar]").onclick = () => {
    store.set({ sidebarCollapsed: !store.state.sidebarCollapsed });
  };

  container.querySelector("[data-toggle-theme]").onclick = () => {
    const next = store.state.theme === "dark" ? "light" : "dark";
    store.set({ theme: next });
  };

  return {
    setTitle(title) {
      container.querySelector("[data-page-title]").textContent = title;
    },
  };
}
