import { createTransport } from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log("\n========================================");
console.log("  EMAIL CONFIGURATION TEST SCRIPT");
console.log("========================================\n");

// Check environment variables
console.log("📋 Environment Variables:");
console.log("  EMAIL_USER:", process.env.EMAIL_USER || "❌ NOT SET");
console.log("  EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "✅ SET" : "❌ NOT SET");
console.log("  Password Length:", process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
console.log("");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.log("❌ ERROR: Email credentials not configured!");
  console.log("\nPlease set the following in your .env file:");
  console.log("  EMAIL_USER=your-email@gmail.com");
  console.log("  EMAIL_PASSWORD=your-gmail-app-password");
  process.exit(1);
}

// Create transporter
console.log("🔧 Creating email transporter...");
const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Test email
const testEmail = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Send to yourself for testing
  subject: "Test Email - Password Reset System",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">🎉 Email Configuration Test</h2>
      <p>If you're reading this, your email configuration is working correctly!</p>
      <div style="background: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Configuration Details:</strong></p>
        <p style="margin: 5px 0;">Email User: ${process.env.EMAIL_USER}</p>
        <p style="margin: 5px 0;">Test Date: ${new Date().toLocaleString()}</p>
      </div>
      <p>✅ Your password reset emails should work now!</p>
    </div>
  `,
  text: `
    Email Configuration Test
    
    If you're reading this, your email configuration is working correctly!
    
    Email User: ${process.env.EMAIL_USER}
    Test Date: ${new Date().toLocaleString()}
    
    Your password reset emails should work now!
  `,
};

console.log("📧 Sending test email to:", process.env.EMAIL_USER);
console.log("");

transporter.sendMail(testEmail, (error, info) => {
  if (error) {
    console.log("❌ EMAIL FAILED TO SEND\n");
    console.log("Error Details:");
    console.log("  Type:", error.constructor.name);
    console.log("  Message:", error.message);
    console.log("  Code:", error.code || "N/A");
    console.log("  Command:", error.command || "N/A");
    
    if (error.code === "EAUTH") {
      console.log("\n💡 Authentication failed! This usually means:");
      console.log("  1. Your Gmail App Password is incorrect");
      console.log("  2. You're using your regular Gmail password (need App Password)");
      console.log("  3. 2-Factor Authentication is not enabled\n");
      console.log("To fix:");
      console.log("  1. Go to https://myaccount.google.com/security");
      console.log("  2. Enable 2-Factor Authentication");
      console.log("  3. Go to App Passwords");
      console.log("  4. Generate a new password for 'Mail'");
      console.log("  5. Update EMAIL_PASSWORD in your .env file");
    }
    
    if (error.code === "ETIMEDOUT" || error.code === "ECONNECTION") {
      console.log("\n💡 Connection failed! This usually means:");
      console.log("  1. Your firewall is blocking port 587");
      console.log("  2. Network connection issues");
      console.log("  3. Gmail SMTP is blocked by your ISP");
    }
    
    console.log("\n");
  } else {
    console.log("✅ EMAIL SENT SUCCESSFULLY!\n");
    console.log("Details:");
    console.log("  Message ID:", info.messageId);
    console.log("  Response:", info.response);
    console.log("\n📬 Check your inbox at:", process.env.EMAIL_USER);
    console.log("   (Don't forget to check spam folder!)");
    console.log("\n🎉 Your password reset system is ready to use!");
    console.log("");
  }
  
  console.log("========================================\n");
});
