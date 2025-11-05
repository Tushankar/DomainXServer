import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import Buyer from "../models/Buyer.js";
import { sendEmail } from "../services/emailService.js";

// Generate JWT Token
const generateToken = (userId, userType = "buyer") => {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET || "your-secret-key",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    }
  );
};

// Set cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

// @desc    Register new buyer
// @route   POST /api/buyer/auth/register
// @access  Public
export const registerBuyer = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, email, password, phone, company } = req.body;

    // Check if buyer already exists
    const existingBuyer = await Buyer.findOne({ email });
    if (existingBuyer) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new buyer
    const buyer = await Buyer.create({
      name,
      email,
      password,
      phone,
      company,
    });

    // Generate token
    const token = generateToken(buyer._id, "buyer");

    // Set cookie
    res.cookie("buyerToken", token, cookieOptions);

    res.status(201).json({
      success: true,
      message: "Buyer account created successfully",
      data: {
        user: {
          id: buyer._id,
          name: buyer.name,
          email: buyer.email,
          phone: buyer.phone,
          company: buyer.company,
        },
      },
    });
  } catch (error) {
    console.error("Buyer registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// @desc    Login buyer
// @route   POST /api/buyer/auth/login
// @access  Public
export const loginBuyer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find buyer and include password
    const buyer = await Buyer.findOne({ email }).select("+password");
    if (!buyer) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is active
    if (!buyer.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Check if account is locked
    if (buyer.isLocked) {
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked due to too many failed login attempts",
      });
    }

    // Check password
    const isPasswordValid = await buyer.comparePassword(password);
    if (!isPasswordValid) {
      await buyer.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Reset login attempts on successful login
    await buyer.resetLoginAttempts();

    // Generate token
    const token = generateToken(buyer._id, "buyer");

    // Set cookie
    res.cookie("buyerToken", token, cookieOptions);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: buyer._id,
          name: buyer.name,
          email: buyer.email,
          phone: buyer.phone,
          company: buyer.company,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Buyer login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Get current buyer profile
// @route   GET /api/buyer/auth/profile
// @access  Private
export const getBuyerProfile = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user.userId);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: buyer._id,
          name: buyer.name,
          username: buyer.username,
          email: buyer.email,
          phone: buyer.phone,
          company: buyer.company,
          businessId: buyer.businessId,
          portfolioLink: buyer.portfolioLink,
          totalDomains: buyer.totalDomains,
          totalSpent: buyer.totalSpent,
          profileImage: buyer.profileImage,
          isVerified: buyer.isVerified,
          lastLogin: buyer.lastLogin,
          createdAt: buyer.createdAt,
          joinDate: buyer.createdAt ? new Date(buyer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : null,
        },
      },
    });
  } catch (error) {
    console.error("Get buyer profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update buyer profile
// @route   PUT /api/buyer/auth/profile
// @access  Private
export const updateBuyerProfile = async (req, res) => {
  try {
    const { name, username, phone, company, businessId, portfolioLink, profileImage } = req.body;

    const buyer = await Buyer.findById(req.user.userId);

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
      });
    }

    // Update fields
    if (name) buyer.name = name;
    if (username !== undefined) buyer.username = username;
    if (phone !== undefined) buyer.phone = phone;
    if (company !== undefined) buyer.company = company;
    if (businessId !== undefined) buyer.businessId = businessId;
    if (portfolioLink !== undefined) buyer.portfolioLink = portfolioLink;
    if (profileImage !== undefined) buyer.profileImage = profileImage;

    await buyer.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: buyer._id,
          name: buyer.name,
          username: buyer.username,
          email: buyer.email,
          phone: buyer.phone,
          company: buyer.company,
          businessId: buyer.businessId,
          portfolioLink: buyer.portfolioLink,
          profileImage: buyer.profileImage,
        },
      },
    });
  } catch (error) {
    console.error("Update buyer profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Logout buyer
// @route   POST /api/buyer/auth/logout
// @access  Private
export const logoutBuyer = async (req, res) => {
  try {
    // Clear cookie
    res.clearCookie("buyerToken");

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Buyer logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

// @desc    Change password
// @route   PUT /api/buyer/auth/change-password
// @access  Private
export const changeBuyerPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    const buyer = await Buyer.findById(req.user.userId).select("+password");

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
      });
    }

    // Check current password
    const isCurrentPasswordValid = await buyer.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    buyer.password = newPassword;
    await buyer.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change buyer password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};