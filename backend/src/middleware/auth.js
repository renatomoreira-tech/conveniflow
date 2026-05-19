const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "conveniflow_secret";

// ─── VERIFICAR TOKEN ─────────────────────────────────────
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

// ─── VERIFICAR ROLE ──────────────────────────────────────
function autorizar(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({ error: "Acesso não autorizado" });
    }
    next();
  };
}

module.exports = { autenticar, autorizar };
