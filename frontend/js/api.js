/**
 * Client API generico: parla con qualunque endpoint /api/<entity>
 * generato automaticamente dal backend.
 */
const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) return null;

  let body = null;
  try {
    body = await res.json();
  } catch {
    /* risposta senza corpo JSON */
  }

  if (!res.ok) {
    const message = body?.errors?.join(" ") || body?.error || `Errore ${res.status}`;
    throw new Error(message);
  }
  return body;
}

export const api = {
  getEntities: () => request("/meta/entities"),
  getDashboardStats: () => request("/dashboard"),

  list: (entity, { search = "", limit = 20, offset = 0 } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (limit) params.set("limit", limit);
    if (offset) params.set("offset", offset);
    return request(`/${entity}?${params.toString()}`);
  },

  getOne: (entity, id) => request(`/${entity}/${id}`),
  create: (entity, data) => request(`/${entity}`, { method: "POST", body: JSON.stringify(data) }),
  update: (entity, id, data) => request(`/${entity}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (entity, id) => request(`/${entity}/${id}`, { method: "DELETE" }),
};
