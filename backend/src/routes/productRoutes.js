const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { autenticar, autorizar } = require("../middleware/auth");

router.get("/products", autenticar, productController.getProducts);
router.get(
  "/products/estoque-baixo",
  autenticar,
  productController.getLowStockProducts,
);
router.get("/products/:id", autenticar, productController.getProductById);
router.post(
  "/products",
  autenticar,
  autorizar("ADMIN", "GERENTE"),
  productController.createProduct,
);
router.put(
  "/products/:id",
  autenticar,
  autorizar("ADMIN", "GERENTE"),
  productController.updateProduct,
);
router.delete(
  "/products/:id",
  autenticar,
  autorizar("ADMIN"),
  productController.deleteProduct,
);

module.exports = router;
