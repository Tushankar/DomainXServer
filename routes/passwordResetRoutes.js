import express from "express";
import {
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from "../controllers/passwordResetController.js";

const router = express.Router();

// POST /api/auth/forgot-password - Request password reset
router.post("/forgot-password", forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post("/reset-password", resetPassword);

// GET /api/auth/verify-reset-token/:token - Verify token validity
router.get("/verify-reset-token/:token", verifyResetToken);

// GET /api/auth/test-email-config - Test email configuration
router.get("/test-email-config", (req, res) => {
  console.log("\n=== EMAIL CONFIG TEST ===");
  console.log("EMAIL_USER:", process.env.EMAIL_USER || "NOT SET");
  console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "SET ✓" : "NOT SET ✗");
  console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "NOT SET (will use default)");
  console.log("========================\n");
  
  res.json({
    success: true,
    config: {
      emailUser: process.env.EMAIL_USER || "NOT SET",
      emailPasswordSet: !!process.env.EMAIL_PASSWORD,
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173 (default)"
    }
  });
});

export default router;
