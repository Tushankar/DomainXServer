import { createTransport } from "nodemailer";

// Email configuration
const createTransporter = () => {
  console.log("\n=== CREATING EMAIL TRANSPORTER ===");
  console.log("Service: Gmail");
  console.log("Email User:", process.env.EMAIL_USER || "NOT SET");
  console.log("Email Password:", process.env.EMAIL_PASSWORD ? "SET (length: " + process.env.EMAIL_PASSWORD.length + ")" : "NOT SET");
  
  // For development, use Gmail or a test SMTP service
  // For production, use a proper email service like SendGrid, AWS SES, etc.
  
  const transporter = createTransport({
    service: "gmail", // You can change this to your email provider
    auth: {
      user: process.env.EMAIL_USER || "your-email@gmail.com",
      pass: process.env.EMAIL_PASSWORD || "your-app-password", // Use App Password for Gmail
    },
  });
  
  console.log("✅ Transporter created");
  return transporter;
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  console.log("\n=== SENDING PASSWORD RESET EMAIL ===");
  console.log("To:", email);
  console.log("Token (first 10 chars):", resetToken.substring(0, 10));
  
  try {
    const transporter = createTransporter();
    
    // Frontend URL (adjust based on your deployment)
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetURL = `${frontendURL}/reset-password?token=${resetToken}`;
    console.log("Reset URL:", resetURL);

    const mailOptions = {
      from: process.env.EMAIL_USER || "DomainX <noreply@domainx.com>",
      to: email,
      subject: "Password Reset Request - DomainX",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">DomainX</h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Admin Portal</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                      
                      <p style="margin: 0 0 20px 0; color: #6c757d; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your admin account password. Click the button below to create a new password:
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetURL}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 0 0 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 6px; word-break: break-all; font-size: 14px; color: #495057;">
                        ${resetURL}
                      </p>

                      <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 6px;">
                        <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                          <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
                        </p>
                      </div>

                      <p style="margin: 20px 0 0 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
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
      `,
      text: `
        Reset Your Password - DomainX Admin Portal
        
        We received a request to reset your admin account password.
        
        Click the link below to create a new password:
        ${resetURL}
        
        This link will expire in 1 hour for security reasons.
        
        If you didn't request a password reset, please ignore this email.
        
        © ${new Date().getFullYear()} DomainX. All rights reserved.
      `,
    };

    console.log("📤 Sending email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("\n=== EMAIL SENDING ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error command:", error.command);
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }
    if (error.responseCode) {
      console.error("Response code:", error.responseCode);
    }
    console.error("Full error object:", JSON.stringify(error, null, 2));
    console.error("========================\n");
    throw error;
  }
};

// Send password change confirmation email
export const sendPasswordChangeConfirmation = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || "DomainX <noreply@domainx.com>",
      to: email,
      subject: "Password Changed Successfully - DomainX",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✓ Password Changed</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px; font-weight: 600;">Hi ${name},</h2>
                      
                      <p style="margin: 0 0 20px 0; color: #6c757d; font-size: 16px; line-height: 1.6;">
                        Your DomainX admin account password has been successfully changed.
                      </p>

                      <div style="margin: 30px 0; padding: 20px; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 6px;">
                        <p style="margin: 0; color: #155724; font-size: 14px; line-height: 1.6;">
                          <strong>✓ Confirmed:</strong> Your password was updated on ${new Date().toLocaleString()}.
                        </p>
                      </div>

                      <p style="margin: 20px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                        If you didn't make this change, please contact our support team immediately.
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin-login" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                              Go to Admin Login
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
      `,
      text: `
        Password Changed Successfully - DomainX
        
        Hi ${name},
        
        Your DomainX admin account password has been successfully changed on ${new Date().toLocaleString()}.
        
        If you didn't make this change, please contact our support team immediately.
        
        © ${new Date().getFullYear()} DomainX. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password change confirmation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    // Don't throw error for confirmation email - it's not critical
    return { success: false, error: error.message };
  }
};

// Generic email sending function
export const sendEmail = async (to, subject, html) => {
  console.log("\n=== SENDING EMAIL ===");
  console.log("To:", to);
  console.log("Subject:", subject);

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || "DomainX <noreply@domainx.com>",
      to: to,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return { success: false, error: error.message };
  }
};

export default {
  sendPasswordResetEmail,
  sendPasswordChangeConfirmation,
  sendEmail,
};
