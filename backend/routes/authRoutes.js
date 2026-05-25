const express = require("express");
const {
  signup,
  login,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");
const { signupRules, loginRules } = require("../middleware/validate");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signupRules, signup);
router.post("/login", loginRules, login);

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOtp);

router.post("/reset-password", resetPassword);



router.get("/me", protect, getMe);

module.exports = router;
