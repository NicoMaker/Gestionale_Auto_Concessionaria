/** Componente modale generico riutilizzabile */
export function openModal({ title, bodyEl, onConfirm, confirmLabel = "Salva", cancelLabel = "Annulla" }) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <div class="modal__title"></div>
        <button class="btn btn--icon" data-close>✕</button>
      </div>
      <div class="modal__body"></div>
      <div class="modal__footer">
        <button class="btn btn--ghost" data-cancel>${cancelLabel}</button>
        <button class="btn btn--primary" data-confirm>${confirmLabel}</button>
      </div>
    </div>
  `;

  overlay.querySelector(".modal__title").textContent = title;
  overlay.querySelector(".modal__body").appendChild(bodyEl);

  const close = () => overlay.remove();
  overlay.querySelector("[data-close]").onclick = close;
  overlay.querySelector("[data-cancel]").onclick = close;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  overlay.querySelector("[data-confirm]").onclick = async () => {
    const result = await onConfirm?.();
    if (result !== false) close();
  };

  document.body.appendChild(overlay);
  return { close };
}

export function confirmDialog(message) {
  return new Promise((resolve) => {
    const body = document.createElement("p");
    body.textContent = message;
    body.style.color = "var(--color-text-muted)";
    openModal({
      title: "Conferma",
      bodyEl: body,
      confirmLabel: "Conferma",
      onConfirm: () => resolve(true),
    });
  });
}
