import { body } from "express-validator";

// Validation for admin registration
export const validateAdminRegistration = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .trim(),
  
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .toLowerCase(),
  
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  
  body("role")
    .optional()
    .isIn(["admin", "super_admin"])
    .withMessage("Role must be either 'admin' or 'super_admin'"),
];

// Validation for admin login
export const validateAdminLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .toLowerCase(),
  
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  
  body("rememberMe")
    .optional()
    .isBoolean()
    .withMessage("Remember me must be a boolean value"),
];

// Validation for profile update
export const validateProfileUpdate = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .trim(),
  
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .toLowerCase(),
];

// Validation for password change
export const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("New password must contain at least one lowercase letter, one uppercase letter, and one number"),
  
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match new password");
      }
      return true;
    }),
];