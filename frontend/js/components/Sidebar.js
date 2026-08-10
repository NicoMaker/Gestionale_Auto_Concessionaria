import { GROUP_ORDER, GROUP_ICONS, getEntityIcon } from "../data/entities.js";
import { router } from "../router.js";

export function renderSidebar(container, entities) {
  const grouped = entities.reduce((acc, e) => {
    (acc[e.group] = acc[e.group] || []).push(e);
    return acc;
  }, {});

  const groups = GROUP_ORDER.filter((g) => grouped[g]);

  container.innerHTML = `
    <div class="sidebar__brand">
      <div class="sidebar__brand-icon">🚗</div>
      <span class="sidebar__brand-text">AutoGest Pro</span>
    </div>
    <nav class="sidebar__nav">
      <a class="sidebar__link" data-path="/dashboard">
        <span class="sidebar__link-icon">${GROUP_ICONS.Dashboard}</span>
        <span class="sidebar__link-text">Dashboard</span>
      </a>
      ${groups
        .map(
          (group) => `
        <div class="sidebar__group-title">${group}</div>
        ${grouped[group]
          .map(
            (e) => `
          <a class="sidebar__link" data-path="/${e.name}">
            <span class="sidebar__link-icon">${getEntityIcon(e.name)}</span>
            <span class="sidebar__link-text">${e.label}</span>
          </a>`,
          )
          .join("")}
      `,
        )
        .join("")}
    </nav>
  `;

  container.querySelectorAll("[data-path]").forEach((link) => {
    link.addEventListener("click", () => router.navigate(link.dataset.path));
  });

  return {
    setActive(path) {
      container.querySelectorAll("[data-path]").forEach((link) => {
        link.classList.toggle("active", link.dataset.path === path);
      });
    },
  };
}
