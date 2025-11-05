import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import Reseller from "../models/Reseller.js";
import { sendEmail } from "../services/emailService.js";

// Generate JWT Token
const generateToken = (userId, userType = "reseller") => {
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

// @desc    Register new reseller
// @route   POST /api/reseller/auth/register
// @access  Public
export const registerReseller = async (req, res) => {
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

    const { name, email, password, phone, company, businessType } = req.body;

    // Check if reseller already exists
    const existingReseller = await Reseller.findOne({ email });
    if (existingReseller) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new reseller
    const reseller = await Reseller.create({
      name,
      email,
      password,
      phone,
      company,
      businessType,
    });

    // Generate token
    const token = generateToken(reseller._id, "reseller");

    // Set cookie
    res.cookie("resellerToken", token, cookieOptions);

    res.status(201).json({
      success: true,
      message: "Reseller account created successfully. Please wait for admin approval.",
      data: {
        user: {
          id: reseller._id,
          name: reseller.name,
          email: reseller.email,
          phone: reseller.phone,
          company: reseller.company,
          businessType: reseller.businessType,
          isApproved: reseller.isApproved,
        },
      },
    });
  } catch (error) {
    console.error("Reseller registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// @desc    Login reseller
// @route   POST /api/reseller/auth/login
// @access  Public
export const loginReseller = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find reseller and include password
    const reseller = await Reseller.findOne({ email }).select("+password");
    if (!reseller) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is active
    if (!reseller.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Check if account is approved
    if (!reseller.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Account is pending admin approval",
      });
    }

    // Check if account is locked
    if (reseller.isLocked) {
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked due to too many failed login attempts",
      });
    }

    // Check password
    const isPasswordValid = await reseller.comparePassword(password);
    if (!isPasswordValid) {
      await reseller.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Reset login attempts on successful login
    await reseller.resetLoginAttempts();

    // Generate token
    const token = generateToken(reseller._id, "reseller");

    // Set cookie
    res.cookie("resellerToken", token, cookieOptions);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: reseller._id,
          name: reseller.name,
          email: reseller.email,
          phone: reseller.phone,
          company: reseller.company,
          businessType: reseller.businessType,
          isApproved: reseller.isApproved,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Reseller login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Get current reseller profile
// @route   GET /api/reseller/auth/profile
// @access  Private
export const getResellerProfile = async (req, res) => {
  try {
    const reseller = await Reseller.findById(req.user.userId);

    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: "Reseller not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: reseller._id,
          name: reseller.name,
          username: reseller.username,
          email: reseller.email,
          phone: reseller.phone,
          company: reseller.company,
          businessId: reseller.businessId,
          portfolioLink: reseller.portfolioLink,
          businessType: reseller.businessType,
          totalSales: reseller.totalSales,
          activeDomains: reseller.activeDomains,
          profileImage: reseller.profileImage,
          isApproved: reseller.isApproved,
          isVerified: reseller.isVerified,
          lastLogin: reseller.lastLogin,
          createdAt: reseller.createdAt,
          joinDate: reseller.createdAt ? new Date(reseller.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : null,
        },
      },
    });
  } catch (error) {
    console.error("Get reseller profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update reseller profile
// @route   PUT /api/reseller/auth/profile
// @access  Private
export const updateResellerProfile = async (req, res) => {
  try {
    const { name, username, phone, company, businessId, portfolioLink, businessType, profileImage } = req.body;

    const reseller = await Reseller.findById(req.user.userId);

    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: "Reseller not found",
      });
    }

    // Check if username is already taken by another user
    if (username && username !== reseller.username) {
      const existingUser = await Reseller.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken",
        });
      }
    }

    // Update fields
    if (name) reseller.name = name;
    if (username !== undefined) reseller.username = username;
    if (phone !== undefined) reseller.phone = phone;
    if (company !== undefined) reseller.company = company;
    if (businessId !== undefined) reseller.businessId = businessId;
    if (portfolioLink !== undefined) reseller.portfolioLink = portfolioLink;
    if (businessType) reseller.businessType = businessType;
    if (profileImage) reseller.profileImage = profileImage;

    await reseller.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: reseller._id,
          name: reseller.name,
          username: reseller.username,
          email: reseller.email,
          phone: reseller.phone,
          company: reseller.company,
          businessId: reseller.businessId,
          portfolioLink: reseller.portfolioLink,
          businessType: reseller.businessType,
          totalSales: reseller.totalSales,
          activeDomains: reseller.activeDomains,
          profileImage: reseller.profileImage,
          joinDate: reseller.createdAt ? new Date(reseller.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : null,
        },
      },
    });
  } catch (error) {
    console.error("Update reseller profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Logout reseller
// @route   POST /api/reseller/auth/logout
// @access  Private
export const logoutReseller = async (req, res) => {
  try {
    // Clear cookie
    res.clearCookie("resellerToken");

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Reseller logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

// @desc    Change password
// @route   PUT /api/reseller/auth/change-password
// @access  Private
export const changeResellerPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    const reseller = await Reseller.findById(req.user.userId).select("+password");

    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: "Reseller not found",
      });
    }

    // Check current password
    const isCurrentPasswordValid = await reseller.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    reseller.password = newPassword;
    await reseller.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change reseller password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};