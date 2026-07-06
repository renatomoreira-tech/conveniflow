const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");
const { autenticar, autorizar } = require("../middleware/auth");

router.get("/clientes", autenticar, clienteController.getClientes);
router.get("/clientes/:id", autenticar, clienteController.getClienteById);
router.post("/clientes", autenticar, clienteController.createCliente);
router.put(
  "/clientes/:id",
  autenticar,
  autorizar("ADMIN", "GERENTE"),
  clienteController.updateCliente,
);
router.delete(
  "/clientes/:id",
  autenticar,
  autorizar("ADMIN", "GERENTE"),
  clienteController.deleteCliente,
);

module.exports = router;
