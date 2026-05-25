const { createLogger, format, transports } = require("winston");
const path = require("path");

const { combine, timestamp, printf, colorize, errors } = format;

const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] ${level}: ${stack || message}`;
});

const fileFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
  return `[${timestamp}] ${level.toUpperCase()}: ${stack || message} ${metaStr}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true })
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), consoleFormat),
    }),

    new transports.File({
      filename: path.join(__dirname, "../logs/combined.log"),
      format: fileFormat,
    }),

    new transports.File({
      filename: path.join(__dirname, "../logs/error.log"),
      level: "error",
      format: fileFormat,
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(__dirname, "../logs/exceptions.log") }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(__dirname, "../logs/rejections.log") }),
  ],
});



module.exports = logger;
