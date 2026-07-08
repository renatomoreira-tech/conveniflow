const express = require("express");
const router = express.Router();
const negocioController = require("../controllers/negocioController");
const { autenticar, autorizar } = require("../middleware/auth");

router.get("/negocios/meu", autenticar, negocioController.getMeuNegocio);
router.patch(
  "/negocios/meu/modulos",
  autenticar,
  autorizar("ADMIN"),
  negocioController.atualizarModulos,
);

module.exports = router;
