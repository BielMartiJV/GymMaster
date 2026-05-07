import jwt from 'jsonwebtoken';

/**
 * Middleware que verifica el JWT de la capçalera Authorization.
 * Afegeix req.user = { id, email, rol } si és vàlid.
 */
export function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return next({ status: 401, message: 'Cal autenticació. Proporciona un token Bearer.' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, rol }
    next();
  } catch {
    next({ status: 401, message: 'Token invàlid o expirat.' });
  }
}

/**
 * Middleware que comprova que el rol de l'usuari sigui 'admin'.
 * Ha d'anar SEMPRE després de requireAuth.
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.rol !== 'admin') {
    return next({ status: 403, message: 'Accés restringit. Només administradors.' });
  }
  next();
}
