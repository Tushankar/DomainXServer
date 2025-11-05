import jwt from "jsonwebtoken";
import Reseller from "../models/Reseller.js";

// Middleware to protect reseller routes
export const authenticateReseller = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Get token from cookie
    else if (req.cookies && req.cookies.resellerToken) {
      token = req.cookies.resellerToken;
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

      // Check if token is for reseller
      if (decoded.userType !== "reseller") {
        return res.status(401).json({
          success: false,
          message: "Access denied. Invalid token type.",
        });
      }

      // Get reseller from token
      const reseller = await Reseller.findById(decoded.userId);
      if (!reseller || !reseller.isActive) {
        return res.status(401).json({
          success: false,
          message: "Access denied. Reseller not found or inactive.",
        });
      }

      // Check if reseller is approved
      if (!reseller.isApproved) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Account pending approval.",
        });
      }

      // Add reseller to request object
      req.user = {
        userId: reseller._id,
        email: reseller.email,
        name: reseller.name,
        userType: "reseller",
      };

      next();
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token.",
      });
    }
  } catch (error) {
    console.error("Reseller authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};