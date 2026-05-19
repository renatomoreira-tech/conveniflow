const express = require("express");
const router = express.Router();
const caixaController = require("../controllers/caixaController");
const { autenticar } = require("../middleware/auth");

router.get("/caixa", autenticar, caixaController.getCaixas);
router.get("/caixa/atual", autenticar, caixaController.getCaixaAtual);
router.post("/caixa/abrir", autenticar, caixaController.abrirCaixa);
router.patch("/caixa/:id/fechar", autenticar, caixaController.fecharCaixa);

module.exports = router;
