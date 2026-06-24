const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const saleRoutes = require("./routes/saleRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");
const fornecedorRoutes = require("./routes/fornecedorRoutes");
const caixaRoutes = require("./routes/caixaRoutes");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://conveniflow.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());

// ─── ROTAS ───────────────────────────────────────────────
app.use(userRoutes);
app.use(productRoutes);
app.use(saleRoutes);
app.use(categoriaRoutes);
app.use(fornecedorRoutes);
app.use(caixaRoutes);

// ─── ROTA BASE ───────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "API ConveniFlow funcionando!" });
});

// ─── ROTA NÃO ENCONTRADA ─────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// ─── TRATAMENTO GLOBAL DE ERROS ──────────────────────────
app.use((err, req, res, next) => {
  console.error("Erro inesperado:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

module.exports = app;
