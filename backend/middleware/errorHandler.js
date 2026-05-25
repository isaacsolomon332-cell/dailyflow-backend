const logger = require("../utils/logger");
const AppError = require("../utils/AppError");

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `An account with ${field} "${value}" already exists`;
  return new AppError(message, 409, "DUPLICATE_FIELD");
};

const handleMongooseValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(messages[0], 422, "VALIDATION_ERROR");
};

const handleCastError = (err) => {
  return new AppError(`Invalid value for field "${err.path}"`, 400, "CAST_ERROR");
};

const sendError = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    code: err.code || "ERROR",
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.code === 11000) error = handleDuplicateKeyError(err);
  else if (err.name === "ValidationError") error = handleMongooseValidationError(err);
  else if (err.name === "CastError") error = handleCastError(err);
  else if (!err.isOperational) {
    logger.error(`Unexpected error: ${err.message}`, { stack: err.stack, url: req.originalUrl });
    error = new AppError("Something went wrong on our end. Please try again later.", 500, "INTERNAL_ERROR");
  }

  if (error.isOperational) {
    logger.warn(`Operational error [${error.code}] on ${req.method} ${req.originalUrl}: ${error.message}`);
  }

  sendError(error, res);
};

const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, "NOT_FOUND"));
};

module.exports = { errorHandler, notFound };
