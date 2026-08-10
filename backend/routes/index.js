const express = require("express");
const SCHEMA = require("../data/schema");
const { buildController } = require("../controllers/genericController");
const dashboardRouter = require("./dashboard");

const router = express.Router();

// Rotta di metadati: il frontend può chiedere la struttura di ogni entità
router.get("/meta/entities", (req, res) => {
  res.json(
    SCHEMA.map((e) => ({
      name: e.name,
      label: e.label,
      group: e.group,
      columns: e.columns,
    })),
  );
});

router.use("/dashboard", dashboardRouter);

// Registrazione automatica delle rotte CRUD per ciascuna delle 24 tabelle
SCHEMA.forEach((entity) => {
  const controller = buildController(entity);
  const entityRouter = express.Router();

  entityRouter.get("/", controller.list);
  entityRouter.get("/:id", controller.getOne);
  entityRouter.post("/", controller.create);
  entityRouter.put("/:id", controller.update);
  entityRouter.delete("/:id", controller.remove);

  router.use(`/${entity.name}`, entityRouter);
});

module.exports = router;
