/**
 * Piccolo store globale con pub/sub: mantiene le entità caricate dal
 * backend e il tema corrente, notificando i componenti interessati.
 */
class Store {
  constructor() {
    this.state = {
      entities: [],
      theme: localStorage.getItem("theme") || "dark",
      sidebarCollapsed: false,
    };
    this.listeners = new Set();
  }

  set(patch) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => fn(this.state));
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getEntity(name) {
    return this.state.entities.find((e) => e.name === name);
  }
}

export const store = new Store();
