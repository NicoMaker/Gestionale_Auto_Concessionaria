const BASE = "/api";

async function request(method, url, body) {
  const res = await fetch(BASE + url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch (_) {}
  if (!res.ok) {
    throw new Error((data && data.error) || `Errore richiesta (${res.status})`);
  }
  return data;
}

export const api = {
  // Auto
  getAuto: (params = {}) => request("GET", "/auto" + qs(params)),
  getAutoById: (id) => request("GET", `/auto/${id}`),
  createAuto: (data) => request("POST", "/auto", data),
  updateAuto: (id, data) => request("PUT", `/auto/${id}`, data),
  deleteAuto: (id) => request("DELETE", `/auto/${id}`),
  getStats: () => request("GET", "/auto/stats/riepilogo"),

  // Clienti
  getClienti: (params = {}) => request("GET", "/clienti" + qs(params)),
  createCliente: (data) => request("POST", "/clienti", data),
  updateCliente: (id, data) => request("PUT", `/clienti/${id}`, data),
  deleteCliente: (id) => request("DELETE", `/clienti/${id}`),

  // Manutenzioni
  getManutenzioni: (params = {}) =>
    request("GET", "/manutenzioni" + qs(params)),
  createManutenzione: (data) => request("POST", "/manutenzioni", data),
  updateManutenzione: (id, data) => request("PUT", `/manutenzioni/${id}`, data),
  deleteManutenzione: (id) => request("DELETE", `/manutenzioni/${id}`),

  // Noleggi
  getNoleggi: () => request("GET", "/noleggi"),
  createNoleggio: (data) => request("POST", "/noleggi", data),
  updateNoleggio: (id, data) => request("PUT", `/noleggi/${id}`, data),
  deleteNoleggio: (id) => request("DELETE", `/noleggi/${id}`),
};

function qs(params) {
  const clean = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (clean.length === 0) return "";
  return (
    "?" +
    clean
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&")
  );
}
