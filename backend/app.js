const express = require("express");
const cors = require("cors");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const logger = require("./utils/logger");

const app = express();





app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://dailyflow-app-frontend.vercel.app",

  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options('*', cors());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`);
    next();
  });
}

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "DailyFlow API is running" });
});

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "DailyFlow API is running" });
});

app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
