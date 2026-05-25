const { verifyToken } = require("../utils/token");
const User = require("../models/User");
const AppError = require("../utils/AppError");

/**
 * protect — verifies JWT and attaches the current user to req.user.
 * Use my any route that requires authentication.
 */
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("You are not logged in. Please log in to continue.", 401, "NOT_AUTHENTICATED"));
    }

    const decoded = verifyToken(token);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError("The account belonging to this token no longer exists.", 401, "USER_NOT_FOUND"));
    }

    if (!currentUser.isActive) {
      return next(new AppError("Your account has been deactivated. Please contact support.", 401, "ACCOUNT_INACTIVE"));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };
