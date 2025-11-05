import express from "express";
import { body } from "express-validator";
import {
  registerReseller,
  loginReseller,
  getResellerProfile,
  updateResellerProfile,
  logoutReseller,
  changeResellerPassword,
} from "../controllers/resellerAuthController.js";
import {
  forgotResellerPassword,
  resetResellerPassword,
  verifyResellerResetToken,
} from "../controllers/resellerPasswordResetController.js";
import { authenticateReseller } from "../middleware/resellerAuth.js";

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
  body("businessType")
    .optional()
    .isIn(["individual", "company", "agency"])
    .withMessage("Business type must be individual, company, or agency"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Public routes
router.post("/register", registerValidation, registerReseller);
router.post("/login", loginValidation, loginReseller);

// Password reset routes (public)
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  forgotResellerPassword
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  resetResellerPassword
);

router.get("/verify-reset-token/:token", verifyResellerResetToken);

// Protected routes
router.get("/profile", authenticateReseller, getResellerProfile);
router.put("/profile", authenticateReseller, updateResellerProfile);
router.post("/logout", authenticateReseller, logoutReseller);
router.put(
  "/change-password",
  authenticateReseller,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  changeResellerPassword
);

export default router;
