require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`DailyFlow API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });

  const shutdown = (signal) => {
    logger.warn(`${signal} received — shutting down gracefully`);
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer();
