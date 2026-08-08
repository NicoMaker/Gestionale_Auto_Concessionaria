// Componente Modal generico: apre un box con header/body/footer.
// fields: [{ name, label, type, options?, required?, value? }]
export function openFormModal({ title, fields, submitLabel = 'Salva', onSubmit }) {
  const root = document.getElementById('modal-root');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  const box = document.createElement('div');
  box.className = 'modal-box';

  box.innerHTML = `
    <div class="modal-header">
      <h3>${title}</h3>
      <button class="btn btn-ghost btn-icon" type="button" data-close>✕</button>
    </div>
    <form class="modal-body" id="modal-form"></form>
    <div class="modal-footer">
      <button class="btn btn-secondary" type="button" data-close>Annulla</button>
      <button class="btn btn-primary" type="submit" form="modal-form">${submitLabel}</button>
    </div>
  `;

  const form = box.querySelector('#modal-form');
  fields.forEach(f => form.appendChild(renderField(f)));

  overlay.appendChild(box);
  root.appendChild(overlay);

  box.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', close));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const values = {};
    fields.forEach(f => {
      const input = form.querySelector(`[name="${f.name}"]`);
      values[f.name] = input.value;
    });
    try {
      await onSubmit(values);
      close();
    } catch (err) {
      showFormError(form, err.message);
    }
  });

  function close() { overlay.remove(); }

  // focus sul primo campo
  setTimeout(() => {
    const first = form.querySelector('input, select, textarea');
    if (first) first.focus();
  }, 30);

  return { close };
}

function renderField(f) {
  const wrap = document.createElement('div');
  wrap.className = 'field';

  const label = document.createElement('label');
  label.textContent = f.label + (f.required ? ' *' : '');
  wrap.appendChild(label);

  let input;
  if (f.type === 'select') {
    input = document.createElement('select');
    (f.options || []).forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (String(opt.value) === String(f.value)) o.selected = true;
      input.appendChild(o);
    });
  } else if (f.type === 'textarea') {
    input = document.createElement('textarea');
    input.rows = 3;
    input.value = f.value ?? '';
  } else {
    input = document.createElement('input');
    input.type = f.type || 'text';
    input.value = f.value ?? '';
    if (f.step) input.step = f.step;
  }

  input.name = f.name;
  if (f.required) input.required = true;
  if (f.placeholder) input.placeholder = f.placeholder;

  wrap.appendChild(input);
  return wrap;
}

function showFormError(form, message) {
  let el = form.querySelector('.form-error');
  if (!el) {
    el = document.createElement('div');
    el.className = 'form-error';
    el.style.color = 'var(--danger)';
    el.style.fontSize = '0.82rem';
    form.prepend(el);
  }
  el.textContent = message;
}

export function openConfirmModal({ title, message, confirmLabel = 'Conferma', danger = true, onConfirm }) {
  const root = document.getElementById('modal-root');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  const box = document.createElement('div');
  box.className = 'modal-box';
  box.style.width = '380px';
  box.innerHTML = `
    <div class="modal-header"><h3>${title}</h3></div>
    <div class="modal-body"><p style="margin:0;color:var(--text-dim)">${message}</p></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" type="button" data-cancel>Annulla</button>
      <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" type="button" data-confirm>${confirmLabel}</button>
    </div>
  `;
  overlay.appendChild(box);
  root.appendChild(overlay);

  box.querySelector('[data-cancel]').addEventListener('click', close);
  box.querySelector('[data-confirm]').addEventListener('click', async () => {
    await onConfirm();
    close();
  });

  function close() { overlay.remove(); }
}
