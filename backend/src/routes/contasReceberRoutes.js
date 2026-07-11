const express = require("express");
const router = express.Router();
const contasReceberController = require("../controllers/contasReceberController");
const { autenticar, autorizar } = require("../middleware/auth");

router.get(
  "/contas-receber",
  autenticar,
  contasReceberController.getContasReceber,
);
router.post(
  "/contas-receber/pagamento",
  autenticar,
  autorizar("ADMIN", "GERENTE"),
  contasReceberController.registrarPagamento,
);

module.exports = router;
