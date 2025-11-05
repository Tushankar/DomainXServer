import express from "express";
import { body } from "express-validator";
import {
  registerBuyer,
  loginBuyer,
  getBuyerProfile,
  updateBuyerProfile,
  logoutBuyer,
  changeBuyerPassword,
} from "../controllers/buyerAuthController.js";
import {
  forgotBuyerPassword,
  resetBuyerPassword,
  verifyBuyerResetToken,
} from "../controllers/buyerPasswordResetController.js";
import { authenticateBuyer } from "../middleware/buyerAuth.js";

const router = express.Router();

// Validation rules
const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("company")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Company name cannot exceed 100 characters"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Public routes
router.post("/register", registerValidation, registerBuyer);
router.post("/login", loginValidation, loginBuyer);

// Password reset routes (public)
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  forgotBuyerPassword
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  resetBuyerPassword
);

router.get("/verify-reset-token/:token", verifyBuyerResetToken);

// Protected routes
router.get("/profile", authenticateBuyer, getBuyerProfile);
router.put("/profile", authenticateBuyer, updateBuyerProfile);
router.post("/logout", authenticateBuyer, logoutBuyer);
router.put(
  "/change-password",
  authenticateBuyer,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  changeBuyerPassword
);

export default router;
