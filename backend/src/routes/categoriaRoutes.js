const express = require("express");
const router = express.Router();
const categoriaController = require("../controllers/categoriaController");
const { autenticar, autorizar } = require("../middleware/auth");

router.get("/categorias", autenticar, categoriaController.getCategorias);
router.post(
  "/categorias",
  autenticar,
  autorizar("ADMIN", "GERENTE"),
  categoriaController.createCategoria,
);
router.put(
  "/categorias/:id",
  autenticar,
  autorizar("ADMIN", "GERENTE"),
  categoriaController.updateCategoria,
);
router.delete(
  "/categorias/:id",
  autenticar,
  autorizar("ADMIN"),
  categoriaController.deleteCategoria,
);

module.exports = router;
