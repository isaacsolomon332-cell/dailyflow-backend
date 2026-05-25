/**
 * AppError — structured operational error.
 * Throw this anywhere in the app; the global error middleware will catch it.
 *
 * @param {string} message  - human-readable message
 * @param {number} statusCode - HTTP status code (400, 401, 404, 409 …)
 * @param {string} [code]   - optional machine-readable error code
 */
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; 
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
