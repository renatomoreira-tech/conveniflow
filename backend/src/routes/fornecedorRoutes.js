const express = require("express");
const router = express.Router();
const fornecedorController = require("../controllers/fornecedorController");
const { autenticar, autorizar } = require("../middleware/auth");

router.get("/fornecedores", autenticar, fornecedorController.getFornecedores);
router.get(
  "/fornecedores/:id",
  autenticar,
  fornecedorController.getFornecedorById,
);
router.post(
  "/fornecedores",
  autenticar,
  autorizar("ADMIN", "GERENTE"),
  fornecedorController.createFornecedor,
);
router.put(
  "/fornecedores/:id",
  autenticar,
  autorizar("ADMIN", "GERENTE"),
  fornecedorController.updateFornecedor,
);
router.delete(
  "/fornecedores/:id",
  autenticar,
  autorizar("ADMIN"),
  fornecedorController.deleteFornecedor,
);

module.exports = router;
