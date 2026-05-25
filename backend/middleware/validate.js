const { body, validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new AppError(messages[0], 422, "VALIDATION_ERROR"));
  }
  next();
};

const signupRules = [
  body("fullName")
    .trim()
    .notEmpty().withMessage("Full name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Full name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 4, max: 30 }).withMessage("Username must be between 4 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),

  body("phoneNumber")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^\+?[1-9]\d{6,14}$/).withMessage("Please provide a valid phone number (e.g. +2348012345678)"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  body("confirmPassword")
    .notEmpty().withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  handleValidationErrors,
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

module.exports = { signupRules, loginRules };
