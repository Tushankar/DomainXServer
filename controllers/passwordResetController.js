import crypto from "crypto";
import AdminUser from "../models/AdminUser.js";
import { sendPasswordResetEmail, sendPasswordChangeConfirmation } from "../services/emailService.js";

// Request password reset
export const forgotPassword = async (req, res) => {
  try {
    console.log("\n=== FORGOT PASSWORD REQUEST ===");
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

    // Find user by email
    console.log("🔍 Searching for user with email:", email.toLowerCase());
    const user = await AdminUser.findOne({ email: email.toLowerCase() });
    console.log("User found:", user ? `Yes (ID: ${user._id})` : "No");

    // Always return success message (security: don't reveal if email exists)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Generate reset token
    console.log("🔐 Generating reset token...");
    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log("Reset token generated (first 10 chars):", resetToken.substring(0, 10));
    
    // Hash token before saving to database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    console.log("Hashed token (first 10 chars):", hashedToken.substring(0, 10));

    // Set token and expiry (1 hour from now)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    console.log("💾 Saving token to database...");
    await user.save();
    console.log("✅ Token saved successfully");

    // Send email with unhashed token
    try {
      console.log("📧 Attempting to send reset email to:", user.email);
      console.log("Environment check:");
      console.log("  - EMAIL_USER:", process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 5)}...` : "NOT SET");
      console.log("  - EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "SET (hidden)" : "NOT SET");
      console.log("  - FRONTEND_URL:", process.env.FRONTEND_URL || "NOT SET (using default)");
      
      await sendPasswordResetEmail(user.email, resetToken);
      console.log("✅ Email sent successfully!");
      
      res.status(200).json({
        success: true,
        message: "Password reset link has been sent to your email.",
      });
    } catch (emailError) {
      // Clear reset token if email fails
      console.log("❌ EMAIL ERROR - Clearing token from database");
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      console.error("\n=== EMAIL ERROR DETAILS ===");
      console.error("Error name:", emailError.name);
      console.error("Error message:", emailError.message);
      console.error("Error code:", emailError.code);
      console.error("Full error:", emailError);
      console.error("========================\n");
      
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again later.",
        debug: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
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
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid reset token
    const user = await AdminUser.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Token not expired
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.loginAttempts = 0; // Reset login attempts
    user.lockUntil = null; // Clear any account locks
    await user.save();

    // Send confirmation email (don't block response)
    sendPasswordChangeConfirmation(user.email, user.name).catch((err) => {
      console.error("Failed to send confirmation email:", err);
    });

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting password. Please try again.",
    });
  }
};

// Verify reset token validity
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    // Hash the token to compare with database
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid reset token
    const user = await AdminUser.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
      email: user.email, // Return email for display
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while verifying token",
    });
  }
};

export default {
  forgotPassword,
  resetPassword,
  verifyResetToken,
};
