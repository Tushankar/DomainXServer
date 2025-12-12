import express from "express";
import { body } from "express-validator";
import {
  registerReseller,
  loginReseller,
  getResellerProfile,
  updateResellerProfile,
  logoutReseller,
  changeResellerPassword,
  getResellerPublicInfo,
} from "../controllers/resellerAuthController.js";
import {
  forgotResellerPassword,
  resetResellerPassword,
  verifyResellerResetToken,
} from "../controllers/resellerPasswordResetController.js";
import {
  createDomainListing,
  getResellerListings,
  updateDomainListing,
  deleteDomainListing,
  updateListingStatus,
} from "../controllers/domainListingController.js";
import { authenticateReseller } from "../middleware/resellerAuth.js";

const router = express.Router();

// Validation rules
const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
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
  body("businessId")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Business ID cannot exceed 50 characters"),
  body("portfolioLink")
    .optional()
    .isURL()
    .withMessage("Please provide a valid portfolio link"),
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

const domainListingValidation = [
  body("domainName")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Domain name must be at least 3 characters")
    .matches(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Please provide a valid domain name"),
  body("category")
    .isIn(["tech", "business", "ecommerce", "health", "finance", "other"])
    .withMessage("Please select a valid category"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("askingPrice")
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage("Asking price must be a positive number"),
  body("minimumOffer")
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage("Minimum offer must be a positive number"),
  body("listingType")
    .optional()
    .isIn(["fixed", "auction", "negotiable"])
    .withMessage("Invalid listing type"),
  body("duration")
    .isNumeric()
    .isInt({ min: 1, max: 365 })
    .withMessage("Duration must be between 1 and 365 days"),
  body("keywords")
    .optional()
    .isString()
    .withMessage("Keywords must be a string"),
  body("registrar")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Registrar name cannot exceed 100 characters"),
  body("expiryDate")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid expiry date"),
  body("traffic")
    .optional()
    .isNumeric()
    .isInt({ min: 0 })
    .withMessage("Traffic must be a non-negative number"),
  body("revenue")
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage("Revenue must be a non-negative number"),
];

// Public routes
router.post("/register", registerValidation, registerReseller);
router.post("/login", loginValidation, loginReseller);
router.get("/public/:id", getResellerPublicInfo);

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
// Domain listing routes
router.post(
  "/domains/listing",
  authenticateReseller,
  domainListingValidation,
  createDomainListing
);
router.get("/domains/listings", authenticateReseller, getResellerListings);
router.put("/domains/listing/:id", authenticateReseller, updateDomainListing);
router.delete(
  "/domains/listing/:id",
  authenticateReseller,
  deleteDomainListing
);
router.patch(
  "/domains/listing/:id/status",
  authenticateReseller,
  updateListingStatus
);

export default router;
