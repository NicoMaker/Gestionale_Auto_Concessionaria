import { api } from "../api.js";
import { getDisplayValue } from "../data/entities.js";

const LABELS_CACHE = new Map();

function humanLabel(name) {
  return name.replace(/_id$/, "").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

async function loadFkOptions(table) {
  if (LABELS_CACHE.has(table)) return LABELS_CACHE.get(table);
  const res = await api.list(table, { limit: 500 });
  const options = (res?.data || []).map((row) => ({ value: row.id, label: getDisplayValue(table, row) }));
  LABELS_CACHE.set(table, options);
  return options;
}

/**
 * Costruisce un form <div> a partire dalle colonne dell'entità.
 * Ritorna { el, getValues } dove getValues() legge i valori correnti.
 */
export async function buildForm(entity, initialData = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "form-grid";

  const fieldEls = {};

  for (const col of entity.columns) {
    const field = document.createElement("div");
    field.className = "form-field";
    if (col.type === "TEXT" && !col.options) field.classList.add("form-field--full");

    const label = document.createElement("label");
    label.textContent = humanLabel(col.name) + (col.required ? " *" : "");
    field.appendChild(label);

    let input;

    if (col.fk) {
      input = document.createElement("select");
      const optEmpty = document.createElement("option");
      optEmpty.value = "";
      optEmpty.textContent = "— nessuno —";
      input.appendChild(optEmpty);
      const options = await loadFkOptions(col.fk.table);
      options.forEach((o) => {
        const opt = document.createElement("option");
        opt.value = o.value;
        opt.textContent = o.label;
        input.appendChild(opt);
      });
      input.value = initialData[col.name] ?? "";
    } else if (col.options) {
      input = document.createElement("select");
      col.options.forEach((o) => {
        const opt = document.createElement("option");
        opt.value = o;
        opt.textContent = o;
        input.appendChild(opt);
      });
      input.value = initialData[col.name] ?? col.options[0];
    } else if (col.type === "BOOLEAN") {
      input = document.createElement("select");
      [
        { v: "1", t: "Sì" },
        { v: "0", t: "No" },
      ].forEach((o) => {
        const opt = document.createElement("option");
        opt.value = o.v;
        opt.textContent = o.t;
        input.appendChild(opt);
      });
      input.value = String(initialData[col.name] ?? 1);
    } else {
      input = document.createElement("input");
      if (col.type === "INTEGER" || col.type === "REAL") input.type = "number";
      else if (col.type === "DATE") input.type = "date";
      else if (col.type === "DATETIME") input.type = "datetime-local";
      else input.type = "text";
      if (col.type === "REAL") input.step = "0.01";
      input.value = initialData[col.name] ?? "";
    }

    input.dataset.field = col.name;
    field.appendChild(input);
    wrapper.appendChild(field);
    fieldEls[col.name] = { input, col };
  }

  function getValues() {
    const values = {};
    for (const [name, { input, col }] of Object.entries(fieldEls)) {
      let val = input.value;
      if (val === "") {
        values[name] = col.required ? val : null;
      } else if (col.type === "INTEGER" || col.type === "BOOLEAN" || col.fk) {
        values[name] = Number(val);
      } else if (col.type === "REAL") {
        values[name] = parseFloat(val);
      } else {
        values[name] = val;
      }
    }
    return values;
  }

  return { el: wrapper, getValues };
}
