/** Componente notifiche toast */
let container;

function ensureContainer() {
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, type = "info", duration = 3500) {
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.textContent = message;
  ensureContainer().appendChild(el);
  setTimeout(() => el.remove(), duration);
}
