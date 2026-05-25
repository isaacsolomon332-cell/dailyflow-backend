const jwt = require("jsonwebtoken");
const AppError = require("./AppError");

const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET is not defined in environment", 500, "MISSING_JWT_SECRET");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new AppError("Your session has expired. Please log in again.", 401, "TOKEN_EXPIRED");
    }
    throw new AppError("Invalid token. Please log in again.", 401, "TOKEN_INVALID");
  }
};

module.exports = { signToken, verifyToken };
