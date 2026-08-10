/**
 * Router minimale basato su hash (#/dashboard, #/clienti, ...).
 * Nessuna dipendenza esterna: adatto a un'app componentizzata leggera.
 */
class Router {
  constructor() {
    this.routes = new Map();
    window.addEventListener("hashchange", () => this.resolve());
  }

  register(path, handler) {
    this.routes.set(path, handler);
    return this;
  }

  navigate(path) {
    window.location.hash = path;
  }

  currentPath() {
    return window.location.hash.replace(/^#/, "") || "/dashboard";
  }

  resolve() {
    const path = this.currentPath();
    const [base] = path.split("?");
    const handler = this.routes.get(base) || this.routes.get("/dashboard");
    handler?.(path);
  }

  start() {
    this.resolve();
  }
}

export const router = new Router();
