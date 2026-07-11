const express = require("express");
const router = express.Router();
const movimentoController = require("../controllers/movimentoEstoqueController");
const { autenticar, autorizar } = require("../middleware/auth");

router.post(
  "/movimentos-estoque/entrada",
  autenticar,
  autorizar("ADMIN", "GERENTE"),
  movimentoController.registrarEntrada,
);
router.get(
  "/movimentos-estoque/produto/:productId",
  autenticar,
  movimentoController.getHistoricoPorProduto,
);

module.exports = router;
