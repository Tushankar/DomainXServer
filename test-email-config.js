import dotenv from "dotenv";
import { sendPasswordResetEmail } from "./services/emailService.js";

// Load environment variables
dotenv.config();

console.log("🧪 Testing Email Configuration...\n");

// Test data
const testEmail = process.argv[2] || "test@example.com";
const testToken = "test-reset-token-12345";
const testUserType = "admin";

console.log("Test Configuration:");
console.log("- Email:", testEmail);
console.log("- User Type:", testUserType);
console.log("- Environment:", process.env.NODE_ENV || "development");
console.log(
  "- SendGrid Key:",
  process.env.SENDGRID_API_KEY ? "SET" : "NOT SET"
);
console.log("- Gmail User:", process.env.EMAIL_USER || "NOT SET");
console.log(
  "- Gmail Password:",
  process.env.EMAIL_PASSWORD ? "SET" : "NOT SET"
);
console.log("");

try {
  console.log("📤 Sending test email...");
  const result = await sendPasswordResetEmail(
    testEmail,
    testToken,
    testUserType
  );

  if (result.success) {
    console.log("✅ Email sent successfully!");
    console.log("Message ID:", result.messageId);
  } else {
    console.log("⚠️ Email sending failed but handled gracefully");
    console.log("Error:", result.error);
  }
} catch (error) {
  console.log("❌ Email sending failed with error:");
  console.log(error.message);
}

console.log("\nTest completed.");
