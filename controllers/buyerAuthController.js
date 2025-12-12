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

    const { name, email, password, phone, company, businessId, portfolioLink } =
      req.body;

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
      businessId,
      portfolioLink,
    });

    // Generate token
    const token = generateToken(buyer._id, "buyer");

    // Set cookie
    res.cookie("buyerToken", token, cookieOptions);

    // Send welcome email
    try {
      const emailSubject = "Welcome to  Domainsxchange - Your Account is Ready!";
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to  Domainsxchange</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to  Domainsxchange</h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Domain Marketplace</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px; font-weight: 600;">Hi ${
                        buyer.name
                      }!</h2>

                      <p style="margin: 0 0 20px 0; color: #6c757d; font-size: 16px; line-height: 1.6;">
                        Welcome to  Domainsxchange! Your buyer account has been created successfully and is ready to use.
                      </p>

                      <div style="margin: 30px 0; padding: 20px; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 6px;">
                        <p style="margin: 0; color: #155724; font-size: 16px; line-height: 1.6;">
                          <strong>✅ Account Status: Active</strong><br>
                          You can now start browsing and purchasing domains from our marketplace.
                        </p>
                      </div>

                      <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                        <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px;">What you can do now:</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #6c757d; line-height: 1.6;">
                          <li>Browse premium domain listings</li>
                          <li>Make secure domain purchases</li>
                          <li>Track your domain portfolio</li>
                          <li>Access exclusive domain deals</li>
                          <li>Manage your account settings</li>
                        </ul>
                      </div>

                      <p style="margin: 20px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                        Start exploring our marketplace and find the perfect domain for your project. If you need any assistance, our support team is here to help.
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${
                              process.env.FRONTEND_URL ||
                              "http://localhost:5173"
                            }" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                              Start Browsing Domains
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6;">
                      <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
                        © ${new Date().getFullYear()}  Domainsxchange. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        This is an automated email. Please do not reply.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      await sendEmail(buyer.email, emailSubject, emailHtml);
      console.log(`✅ Welcome email sent to ${buyer.email}`);
    } catch (emailError) {
      console.error("❌ Failed to send welcome email:", emailError);
      // Don't fail registration if email fails
    }

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
          isApproved: buyer.isApproved,
          isActive: buyer.isActive,
        },
        token,
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
        message:
          "Account is temporarily locked due to too many failed login attempts",
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
          isApproved: buyer.isApproved,
          isActive: buyer.isActive,
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
          isActive: buyer.isActive,
          isApproved: buyer.isApproved,
          isVerified: buyer.isVerified,
          lastLogin: buyer.lastLogin,
          createdAt: buyer.createdAt,
          joinDate: buyer.createdAt
            ? new Date(buyer.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })
            : null,
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
    const {
      name,
      username,
      phone,
      company,
      businessId,
      portfolioLink,
      profileImage,
    } = req.body;

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
          totalDomains: buyer.totalDomains,
          totalSpent: buyer.totalSpent,
          profileImage: buyer.profileImage,
          isActive: buyer.isActive,
          isApproved: buyer.isApproved,
          isVerified: buyer.isVerified,
          lastLogin: buyer.lastLogin,
          createdAt: buyer.createdAt,
          joinDate: buyer.createdAt
            ? new Date(buyer.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })
            : null,
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
