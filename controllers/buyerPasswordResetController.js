import crypto from "crypto";
import Buyer from "../models/Buyer.js";
import {
  sendPasswordResetEmail,
  sendPasswordChangeConfirmation,
} from "../services/emailService.js";

// Request password reset for buyer
export const forgotBuyerPassword = async (req, res) => {
  try {
    console.log("\n=== FORGOT BUYER PASSWORD REQUEST ===");
    const { email } = req.body;
    console.log("Request body:", req.body);
    console.log("Email received:", email);

    if (!email) {
      console.log("❌ ERROR: No email provided");
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find buyer by email
    console.log("🔍 Searching for buyer with email:", email.toLowerCase());
    const buyer = await Buyer.findOne({ email: email.toLowerCase() });
    console.log("Buyer found:", buyer ? `Yes (ID: ${buyer._id})` : "No");

    // Always return success message (security: don't reveal if email exists)
    if (!buyer) {
      return res.status(200).json({
        success: true,
        message:
          "If a buyer account exists with this email, you will receive a password reset link.",
      });
    }

    // Check if buyer is active
    if (!buyer.isActive) {
      return res.status(200).json({
        success: true,
        message:
          "If a buyer account exists with this email, you will receive a password reset link.",
      });
    }

    // Generate reset token
    console.log("🔐 Generating reset token...");
    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log(
      "Reset token generated (first 10 chars):",
      resetToken.substring(0, 10)
    );

    // Hash token before saving to database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    console.log("Hashed token (first 10 chars):", hashedToken.substring(0, 10));

    // Set token and expiry (1 hour from now)
    buyer.resetPasswordToken = hashedToken;
    buyer.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    console.log("💾 Saving token to database...");
    await buyer.save();
    console.log("✅ Token saved successfully");

    // Send email with unhashed token
    try {
      console.log("📧 Attempting to send reset email to:", buyer.email);
      console.log("Environment check:");
      console.log(
        "  - EMAIL_USER:",
        process.env.EMAIL_USER
          ? `${process.env.EMAIL_USER.substring(0, 5)}...`
          : "NOT SET"
      );
      console.log(
        "  - EMAIL_PASSWORD:",
        process.env.EMAIL_PASSWORD ? "SET (hidden)" : "NOT SET"
      );
      console.log(
        "  - FRONTEND_URL:",
        process.env.FRONTEND_URL || "NOT SET (using default)"
      );

      await sendPasswordResetEmail(buyer.email, resetToken, "buyer");
      console.log("✅ Email sent successfully!");

      res.status(200).json({
        success: true,
        message: "Password reset link has been sent to your email.",
      });
    } catch (emailError) {
      // Clear reset token if email fails
      console.log("❌ EMAIL ERROR - Clearing token from database");
      buyer.resetPasswordToken = null;
      buyer.resetPasswordExpires = null;
      await buyer.save();

      console.error("\n=== EMAIL ERROR DETAILS ===");
      console.error("Error name:", emailError.name);
      console.error("Error message:", emailError.message);
      console.error("Error code:", emailError.code);
      console.error("Full error object:", emailError);
      console.error("========================\n");

      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again later.",
        debug:
          process.env.NODE_ENV === "development"
            ? emailError.message
            : undefined,
      });
    }
  } catch (error) {
    console.error("Forgot buyer password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
};

// Reset buyer password with token
export const resetBuyerPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash the token from URL to compare with database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find buyer with valid reset token
    const buyer = await Buyer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Token not expired
    });

    if (!buyer) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password (will be hashed by pre-save hook)
    buyer.password = newPassword;
    buyer.resetPasswordToken = null;
    buyer.resetPasswordExpires = null;
    buyer.loginAttempts = 0; // Reset login attempts
    buyer.lockUntil = null; // Clear any account locks
    await buyer.save();

    // Send confirmation email (don't block response)
    sendPasswordChangeConfirmation(buyer.email, buyer.name).catch((err) => {
      console.error("Failed to send confirmation email:", err);
    });

    res.status(200).json({
      success: true,
      message:
        "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset buyer password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting password. Please try again.",
    });
  }
};

// Verify buyer reset token validity
export const verifyBuyerResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    // Hash the token to compare with database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find buyer with valid reset token
    const buyer = await Buyer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!buyer) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
      email: buyer.email, // Return email for display
    });
  } catch (error) {
    console.error("Verify buyer token error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while verifying token",
    });
  }
};

export default {
  forgotBuyerPassword,
  resetBuyerPassword,
  verifyBuyerResetToken,
};
