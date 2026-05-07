/**
 * Middleware centralitzat de gestió d'errors.
 * Ha de ser l'ÚLTIM middleware registrat a index.js.
 *
 * Format de resposta uniforme:
 * { ok: false, error: "missatge", codi: 400 }
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Error intern del servidor';

  // Errors coneguts de MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      ok: false,
      error: 'Ja existeix un registre amb aquestes dades.',
      codi: 409,
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      ok: false,
      error: 'Referència a registre inexistent a la base de dades.',
      codi: 400,
    });
  }

  res.status(status).json({
    ok: false,
    error: message,
    codi: status,
  });
}
