const GenericRepository = require("../repositories/genericRepository");
const realtime = require("../realtime");

/** Valida il body rispetto ai campi "required" dell'entità */
function validate(entity, body, { partial = false } = {}) {
  const errors = [];
  entity.columns.forEach((col) => {
    const value = body[col.name];
    if (!partial && col.required && (value === undefined || value === null || value === "")) {
      errors.push(`Il campo "${col.name}" è obbligatorio.`);
    }
    if (col.options && value !== undefined && value !== null && value !== "" && !col.options.includes(value)) {
      errors.push(`Valore non valido per "${col.name}". Ammessi: ${col.options.join(", ")}.`);
    }
  });
  return errors;
}

/** Crea un router-controller CRUD completo per una data entità */
function buildController(entity) {
  const repo = new GenericRepository(entity);

  return {
    async list(req, res, next) {
      try {
        const { search, limit, offset } = req.query;
        const [rows, total] = await Promise.all([repo.findAll({ search, limit, offset }), repo.count()]);
        res.json({ data: rows, total, entity: entity.name });
      } catch (err) {
        next(err);
      }
    },

    async getOne(req, res, next) {
      try {
        const row = await repo.findById(req.params.id);
        if (!row) return res.status(404).json({ error: `${entity.label} non trovato/a.` });
        res.json(row);
      } catch (err) {
        next(err);
      }
    },

    async create(req, res, next) {
      try {
        const errors = validate(entity, req.body);
        if (errors.length) return res.status(400).json({ errors });
        const id = await repo.create(req.body);
        const row = await repo.findById(id);
        realtime.emitEntityChange(entity.name, "create", row);
        res.status(201).json(row);
      } catch (err) {
        next(err);
      }
    },

    async update(req, res, next) {
      try {
        const existing = await repo.findById(req.params.id);
        if (!existing) return res.status(404).json({ error: `${entity.label} non trovato/a.` });
        const errors = validate(entity, req.body, { partial: true });
        if (errors.length) return res.status(400).json({ errors });
        await repo.update(req.params.id, req.body);
        const row = await repo.findById(req.params.id);
        realtime.emitEntityChange(entity.name, "update", row);
        res.json(row);
      } catch (err) {
        next(err);
      }
    },

    async remove(req, res, next) {
      try {
        const changes = await repo.remove(req.params.id);
        if (!changes) return res.status(404).json({ error: `${entity.label} non trovato/a.` });
        realtime.emitEntityChange(entity.name, "delete", { id: Number(req.params.id) });
        res.status(204).end();
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { buildController, validate };
