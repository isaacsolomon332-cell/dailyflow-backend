const crypto = require("crypto");
const User = require("../models/User");
const { signToken } = require("../utils/token");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const {
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendOtpEmail,
  sendPasswordChangedEmail,
} = require("../utils/email");

const sendTokenResponse   = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user: user.toSafeObject(),
    },
  });
};

const signup = async (req, res, next) => {
  try {
    
    const { fullName, email, username, phoneNumber, password } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return next(new AppError("An account with this email already exists", 409, "EMAIL_TAKEN"));
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return next(new AppError("This username is already taken", 409, "USERNAME_TAKEN"));
    }

    const user = await User.create({
      fullName,
      email,
      username,
      phoneNumber,
      password,
    });

    logger.info(`New user registered: ${user.email} (${user.username})`);

    // sendWelcomeEmail(user).catch((err) =>
    //   logger.error(`Welcome email failed for ${user.email}: ${err.message}`)
    // );

    // Send welcome email
try {
  await sendWelcomeEmail(user);
  logger.info(`Welcome email sent successfully to ${user.email}`);
} catch (err) {
  logger.error(`Welcome email error: ${err.message}`);
}
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS"));
    }

    if (!user.isActive) {
      return next(new AppError("Your account has been deactivated. Please contact support.", 401, "ACCOUNT_INACTIVE"));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS"));
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    logger.info(`User logged in: ${user.email}`);

    sendLoginNotificationEmail(user).catch((err) =>
      logger.error(`Login notification email failed for ${user.email}: ${err.message}`)
    );

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user.toSafeObject(),
      },
    });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Please provide your email address", 400, "EMAIL_REQUIRED"));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.isActive) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a reset code has been sent.",
      });
    }

    const otp = user.createPasswordResetOtp();
    await user.save({ validateBeforeSave: false });

    logger.info(`Password reset OTP generated for: ${user.email}`);

    try {
      await sendOtpEmail(user, otp);
    } catch (emailErr) {
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpires = undefined;
      user.passwordResetOtpAttempts = undefined;
      await user.save({ validateBeforeSave: false });

      logger.error(`OTP email failed for ${user.email}: ${emailErr.message}`);
      return next(new AppError("Failed to send reset email. Please try again later.", 500, "EMAIL_FAILED"));
    }

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset code has been sent.",
    });
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new AppError("Email and OTP are required", 400, "MISSING_FIELDS"));
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+passwordResetOtp +passwordResetOtpExpires +passwordResetOtpAttempts");

    if (!user || !user.passwordResetOtp) {
      return next(new AppError("Invalid or expired OTP", 400, "INVALID_OTP"));
    }

    if (user.passwordResetOtpExpires < new Date()) {
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpires = undefined;
      user.passwordResetOtpAttempts = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError("OTP has expired. Please request a new one.", 400, "OTP_EXPIRED"));
    }

    if (user.passwordResetOtpAttempts >= 5) {
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpires = undefined;
      user.passwordResetOtpAttempts = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError("Too many attempts. Please request a new OTP.", 429, "TOO_MANY_ATTEMPTS"));
    }

    const hashedOtp = crypto.createHash("sha256").update(otp.toString()).digest("hex");

    if (hashedOtp !== user.passwordResetOtp) {
      user.passwordResetOtpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return next(new AppError("Invalid OTP. Please try again.", 400, "INVALID_OTP"));
    }

    const resetToken = signToken(user._id, process.env.OTP_RESET_EXPIRES_IN || "15m");

    logger.info(`OTP verified for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "OTP verified. You may now reset your password.",
      resetToken,
    });
  } catch (err) {
    next(err);
  }
};


const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return next(new AppError("Email, OTP, new password, and confirm password are required", 400, "MISSING_FIELDS"));
    }

    if (newPassword !== confirmPassword) {
      return next(new AppError("Passwords do not match", 400, "PASSWORD_MISMATCH"));
    }

    if (newPassword.length < 6) {
      return next(new AppError("Password must be at least 6 characters", 400, "PASSWORD_TOO_SHORT"));
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password +passwordResetOtp +passwordResetOtpExpires +passwordResetOtpAttempts");

    if (!user || !user.passwordResetOtp) {
      return next(new AppError("Invalid or expired OTP", 400, "INVALID_OTP"));
    }

    if (user.passwordResetOtpExpires < new Date()) {
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpires = undefined;
      user.passwordResetOtpAttempts = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError("OTP has expired. Please request a new one.", 400, "OTP_EXPIRED"));
    }

    if (user.passwordResetOtpAttempts >= 5) {
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpires = undefined;
      user.passwordResetOtpAttempts = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError("Too many attempts. Please request a new OTP.", 429, "TOO_MANY_ATTEMPTS"));
    }

    const hashedOtp = crypto.createHash("sha256").update(otp.toString()).digest("hex");

    if (hashedOtp !== user.passwordResetOtp) {
      user.passwordResetOtpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return next(new AppError("Invalid OTP. Please try again.", 400, "INVALID_OTP"));
    }

    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return next(new AppError("New password must be different from your current password", 400, "SAME_PASSWORD"));
    }

    user.password = newPassword; 
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpires = undefined;
    user.passwordResetOtpAttempts = undefined;
    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);

    sendPasswordChangedEmail(user).catch((err) =>
      logger.error(`Password changed email failed for ${user.email}: ${err.message}`)
    );

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in with your new password.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe, forgotPassword, verifyOtp, resetPassword };
