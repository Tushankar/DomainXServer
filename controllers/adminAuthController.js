import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import AdminUser from "../models/AdminUser.js";
import Buyer from "../models/Buyer.js";
import Reseller from "../models/Reseller.js";
import { sendEmail } from "../services/emailService.js";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
};

// @desc    Register new admin (Only via Postman/API)
// @route   POST /api/admin/auth/register
// @access  Public (but should be restricted in production)
export const registerAdmin = async (req, res) => {
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

    const { name, email, password, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // Create new admin
    const admin = await AdminUser.create({
      name,
      email,
      password,
      role: role || "admin",
    });

    // Generate token
    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          createdAt: admin.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Error registering admin:", error);

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error registering admin",
      error: error.message,
    });
  }
};

// @desc    Login admin
// @route   POST /api/admin/auth/login
// @access  Public
export const loginAdmin = async (req, res) => {
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

    const { email, password, rememberMe } = req.body;

    // Find admin by email (including password)
    const admin = await AdminUser.findByEmailForLogin(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        message:
          "Account is temporarily locked due to too many failed login attempts. Please try again later.",
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await admin.incLoginAttempts();

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Generate token with different expiry based on rememberMe
    const tokenExpiry = rememberMe ? "30d" : "24h";
    const token = jwt.sign(
      { userId: admin._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: tokenExpiry }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          lastLogin: admin.lastLogin,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in admin",
      error: error.message,
    });
  }
};

// @desc    Get current admin profile
// @route   GET /api/admin/auth/profile
// @access  Private
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin profile retrieved successfully",
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error getting admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Error getting admin profile",
      error: error.message,
    });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/auth/profile
// @access  Private
export const updateAdminProfile = async (req, res) => {
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

    const { name, email } = req.body;
    const admin = await AdminUser.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check if email is being changed to an existing email
    if (email && email !== admin.email) {
      const existingAdmin = await AdminUser.findOne({
        email,
        _id: { $ne: admin._id },
      });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another admin",
        });
      }
    }

    // Update admin
    const updatedAdmin = await AdminUser.findByIdAndUpdate(
      req.admin.id,
      { name, email },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        admin: {
          id: updatedAdmin._id,
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          role: updatedAdmin.role,
          updatedAt: updatedAdmin.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating admin profile",
      error: error.message,
    });
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/auth/change-password
// @access  Private
export const changeAdminPassword = async (req, res) => {
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

    const { currentPassword, newPassword } = req.body;
    const admin = await AdminUser.findById(req.admin.id).select("+password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing admin password:", error);
    res.status(500).json({
      success: false,
      message: "Error changing admin password",
      error: error.message,
    });
  }
};

// @desc    Logout admin (Optional: for token blacklisting if implemented)
// @route   POST /api/admin/auth/logout
// @access  Private
export const logoutAdmin = async (req, res) => {
  try {
    // In a simple JWT setup, logout is handled client-side by removing the token
    // For enhanced security, you might implement token blacklisting here

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error logging out admin:", error);
    res.status(500).json({
      success: false,
      message: "Error logging out admin",
      error: error.message,
    });
  }
};

// @desc    Verify admin token
// @route   GET /api/admin/auth/verify
// @access  Private
export const verifyAdminToken = async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error("Error verifying admin token:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying admin token",
      error: error.message,
    });
  }
};

// @desc    Get all users (Buyers, Sellers, Admins)
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    // Get all buyers
    const buyers = await Buyer.find(
      {},
      {
        password: 0,
        __v: 0,
      }
    ).sort({ createdAt: -1 });

    // Get all resellers/sellers
    const sellers = await Reseller.find(
      {},
      {
        password: 0,
        __v: 0,
      }
    ).sort({ createdAt: -1 });

    // Get all admins
    const admins = await AdminUser.find(
      {},
      {
        password: 0,
        loginAttempts: 0,
        lockUntil: 0,
        __v: 0,
      }
    ).sort({ createdAt: -1 });

    // Combine and format users
    const allUsers = [
      ...buyers.map((user) => ({ ...user.toObject(), role: "buyer" })),
      ...sellers.map((user) => ({ ...user.toObject(), role: "seller" })),
      ...admins.map((user) => ({ ...user.toObject(), role: "admin" })),
    ];

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users: allUsers,
        total: allUsers.length,
        breakdown: {
          buyers: buyers.length,
          sellers: sellers.length,
          admins: admins.length,
        },
      },
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({
      success: false,
      message: "Error getting users",
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      role,
      isActive,
      phone,
      company,
      username,
      businessId,
      portfolioLink,
    } = req.body;

    // Find user in all collections
    let user = await Buyer.findById(id);
    let userType = "buyer";

    if (!user) {
      user = await Reseller.findById(id);
      userType = "seller";
    }

    if (!user) {
      user = await AdminUser.findById(id);
      userType = "admin";
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined && userType !== "admin") user.role = role; // Don't allow changing admin roles
    if (typeof isActive === "boolean") user.isActive = isActive;
    if (phone !== undefined) user.phone = phone;
    if (company !== undefined) user.company = company;
    if (username !== undefined) user.username = username;
    if (businessId !== undefined) user.businessId = businessId;
    if (portfolioLink !== undefined) user.portfolioLink = portfolioLink;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        user: {
          ...user.toObject(),
          role: userType,
          password: undefined,
          __v: undefined,
        },
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete user from appropriate collection
    let deletedUser = await Buyer.findByIdAndDelete(id);
    let userType = "buyer";

    if (!deletedUser) {
      deletedUser = await Reseller.findByIdAndDelete(id);
      userType = "seller";
    }

    if (!deletedUser) {
      deletedUser = await AdminUser.findByIdAndDelete(id);
      userType = "admin";
    }

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {
        user: {
          ...deletedUser.toObject(),
          role: userType,
        },
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// @desc    Approve reseller
// @route   PATCH /api/admin/users/:id/approve
// @access  Private (Admin only)
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user - only resellers can be approved
    const user = await Reseller.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Reseller not found",
      });
    }

    // Check if already approved
    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: "User is already approved",
      });
    }

    user.isApproved = true;
    await user.save();

    // Send approval email
    try {
      const emailSubject =
        "Account Approved - Welcome to DomainX Reseller Portal";
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Approved</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✓ Account Approved</h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Welcome to DomainX</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px; font-weight: 600;">Congratulations ${
                        user.name
                      }!</h2>

                      <p style="margin: 0 0 20px 0; color: #6c757d; font-size: 16px; line-height: 1.6;">
                        Your DomainX reseller account has been approved by our admin team. You can now access all the features of our reseller portal.
                      </p>

                      <div style="margin: 30px 0; padding: 20px; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 6px;">
                        <p style="margin: 0; color: #155724; font-size: 16px; line-height: 1.6;">
                          <strong>✓ Your account is now active</strong><br>
                          You can start listing domains, managing your portfolio, and accessing exclusive reseller features.
                        </p>
                      </div>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${
                              process.env.FRONTEND_URL ||
                              "http://localhost:5173"
                            }/reseller-login" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                              Access Reseller Portal
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                        <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px;">What you can do now:</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #6c757d; line-height: 1.6;">
                          <li>List and manage your domain portfolio</li>
                          <li>Access exclusive pricing and deals</li>
                          <li>Track your sales and earnings</li>
                          <li>Connect with potential buyers</li>
                          <li>Manage your business profile</li>
                        </ul>
                      </div>

                      <p style="margin: 20px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                        If you have any questions or need assistance, please don't hesitate to contact our support team.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6;">
                      <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
                        © ${new Date().getFullYear()} DomainX. All rights reserved.
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

      await sendEmail(user.email, emailSubject, emailHtml);
      console.log(`✅ Approval email sent to ${user.email}`);
    } catch (emailError) {
      console.error("❌ Failed to send approval email:", emailError);
      // Don't fail the approval if email fails
    }

    res.status(200).json({
      success: true,
      message: "Reseller approved successfully",
      data: {
        user: {
          ...user.toObject(),
          role: "seller",
          password: undefined,
          __v: undefined,
        },
      },
    });
  } catch (error) {
    console.error("Error approving reseller:", error);
    res.status(500).json({
      success: false,
      message: "Error approving reseller",
      error: error.message,
    });
  }
};

// @desc    Toggle user status (active/inactive)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin only)
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user in all collections
    let user = await Buyer.findById(id);
    let userType = "buyer";

    if (!user) {
      user = await Reseller.findById(id);
      userType = "seller";
    }

    if (!user) {
      user = await AdminUser.findById(id);
      userType = "admin";
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Toggle the isActive status
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      data: {
        user: {
          ...user.toObject(),
          role: userType,
          password: undefined,
          __v: undefined,
        },
      },
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling user status",
      error: error.message,
    });
  }
};
