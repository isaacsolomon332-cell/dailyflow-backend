const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    logger.error("MONGO_URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    logger.info(`MongoDB connected → ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected");
});

module.exports = connectDB;
