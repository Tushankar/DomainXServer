import jwt from "jsonwebtoken";
import Buyer from "../models/Buyer.js";

// Middleware to protect buyer routes
export const authenticateBuyer = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Get token from cookie
    else if (req.cookies && req.cookies.buyerToken) {
      token = req.cookies.buyerToken;
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

      // Check if token is for buyer
      if (decoded.userType !== "buyer") {
        return res.status(401).json({
          success: false,
          message: "Access denied. Invalid token type.",
        });
      }

      // Get buyer from token
      const buyer = await Buyer.findById(decoded.userId);
      if (!buyer || !buyer.isActive) {
        return res.status(401).json({
          success: false,
          message: "Access denied. Buyer not found or inactive.",
        });
      }

      // Add buyer to request object
      req.user = {
        userId: buyer._id,
        email: buyer.email,
        name: buyer.name,
        userType: "buyer",
      };

      next();
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token.",
      });
    }
  } catch (error) {
    console.error("Buyer authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};