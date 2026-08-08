export function mountTopbar({
  title,
  subtitle,
  searchPlaceholder,
  onSearch,
  actionLabel,
  onAction,
}) {
  const el = document.getElementById("topbar");
  el.innerHTML = `
    <div>
      <div class="page-title">${title}</div>
      <div class="page-subtitle">${subtitle || ""}</div>
    </div>
    <div class="topbar-actions">
      ${
        searchPlaceholder
          ? `
        <div class="search-box">
          <span>🔎</span>
          <input type="text" id="topbar-search" placeholder="${searchPlaceholder}" />
        </div>`
          : ""
      }
      ${actionLabel ? `<button class="btn btn-primary" id="topbar-action">+ ${actionLabel}</button>` : ""}
    </div>
  `;

  if (onSearch) {
    let t;
    el.querySelector("#topbar-search").addEventListener("input", (e) => {
      clearTimeout(t);
      t = setTimeout(() => onSearch(e.target.value), 250);
    });
  }
  if (onAction) {
    el.querySelector("#topbar-action").addEventListener("click", onAction);
  }
}
