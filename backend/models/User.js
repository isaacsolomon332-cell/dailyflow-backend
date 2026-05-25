const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[1-9]\d{6,14}$/, "Please provide a valid phone number"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    passwordResetOtp: {
      type: String,
      select: false,
    },

    passwordResetOtpExpires: {
      type: Date,
      select: false,
    },

    passwordResetOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true, 
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.passwordResetOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  this.passwordResetOtpAttempts = 0;

  return otp; 
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetOtp;
  delete obj.passwordResetOtpExpires;
  delete obj.passwordResetOtpAttempts;
  return obj;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
