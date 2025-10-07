import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser.js";

// Middleware to protect admin routes
export const authenticateAdmin = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      
      // Get admin from token
      const admin = await AdminUser.findById(decoded.userId);
      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: "Access denied. Admin not found or inactive.",
        });
      }

      // Add admin to request object
      req.admin = {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      };

      next();
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token.",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};

// Middleware to check if admin has specific role
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      });
    }

    // Convert single role to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

// Middleware to check if admin is super admin
export const requireSuperAdmin = requireRole("super_admin");