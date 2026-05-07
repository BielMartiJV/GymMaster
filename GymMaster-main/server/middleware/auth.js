const jwt = require("jsonwebtoken");

const JWT_SECRET = "gymmaster_secret_key_2026";

/**
 * Middleware que verifica el JWT del header Authorization.
 * Si és vàlid, afegeix req.user = { id, email, name }.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token d'autenticació requerit" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invàlid o expirat" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.userType !== "admin" || req.user.isAdmin !== true) {
    return res.status(403).json({ error: "Acces restringit a administradors" });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, JWT_SECRET };
