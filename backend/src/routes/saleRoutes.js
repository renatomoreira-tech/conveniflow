const express = require("express");
const router = express.Router();
const saleController = require("../controllers/saleController");
const { autenticar, autorizar } = require("../middleware/auth");

router.post("/sales", autenticar, saleController.createSale);
router.get("/sales", autenticar, saleController.getSales);
router.get(
  "/sales/relatorio",
  autenticar,
  autorizar("ADMIN", "GERENTE"),
  saleController.getSalesByPeriod,
);
router.get("/sales/resumo-hoje", autenticar, saleController.getResumoHoje);
router.get("/sales/:id", autenticar, saleController.getSaleById);
router.patch(
  "/sales/:id/cancelar",
  autenticar,
  autorizar("ADMIN", "GERENTE"),
  saleController.cancelSale,
);

module.exports = router;
