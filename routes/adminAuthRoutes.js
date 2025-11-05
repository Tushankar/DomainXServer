import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  logoutAdmin,
  verifyAdminToken,
  getAllUsers,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../controllers/adminAuthController.js";
import { authenticateAdmin, requireSuperAdmin } from "../middleware/adminAuth.js";
import {
  validateAdminRegistration,
  validateAdminLogin,
  validateProfileUpdate,
  validatePasswordChange,
} from "../middleware/adminValidation.js";

const router = express.Router();

// Test route to verify routing works
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Admin auth routes are working",
    timestamp: new Date().toISOString(),
  });
});

// Public routes
router.post("/register", registerAdmin); // Temporarily removed validation
router.post("/login", validateAdminLogin, loginAdmin);

// Protected routes
router.use(authenticateAdmin); // Apply authentication to all routes below

router.get("/profile", getAdminProfile);
router.put("/profile", validateProfileUpdate, updateAdminProfile);
router.put("/change-password", validatePasswordChange, changeAdminPassword);
router.post("/logout", logoutAdmin);
router.get("/verify", verifyAdminToken);

// User management routes (Admin only)
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/status", toggleUserStatus);

export default router;