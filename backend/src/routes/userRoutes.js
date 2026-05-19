const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { autenticar, autorizar } = require("../middleware/auth");

// ─── ROTAS PÚBLICAS (sem token) ──────────────────────────
router.post("/users/login", userController.login);
router.post("/users", userController.createUser);

// ─── ROTAS PROTEGIDAS (precisam de token) ────────────────
router.get(
  "/users",
  autenticar,
  autorizar("ADMIN", "GERENTE"),
  userController.getUsers,
);
router.get("/users/:id", autenticar, userController.getUserById);
router.put(
  "/users/:id",
  autenticar,
  autorizar("ADMIN"),
  userController.updateUser,
);
router.delete(
  "/users/:id",
  autenticar,
  autorizar("ADMIN"),
  userController.deleteUser,
);

module.exports = router;
