import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log("\n╔════════════════════════════════════════════════════════╗");
console.log("║         GMAIL APP PASSWORD VERIFICATION               ║");
console.log("╚════════════════════════════════════════════════════════╝\n");

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

console.log("📧 Email User:");
console.log("   ", emailUser || "❌ NOT SET");
console.log("");

console.log("🔐 Email Password:");
if (!emailPassword) {
  console.log("   ❌ NOT SET");
} else {
  console.log("   ✅ SET");
  console.log("   Length:", emailPassword.length, emailPassword.length === 16 ? "✅ CORRECT" : "❌ SHOULD BE 16");
  console.log("   Value:", emailPassword);
  console.log("");
  
  // Check for common issues
  const issues = [];
  
  if (emailPassword.includes(" ")) {
    issues.push("❌ Contains spaces - remove them!");
  }
  
  if (emailPassword.length !== 16) {
    issues.push(`❌ Wrong length (${emailPassword.length} chars) - should be 16 characters`);
  }
  
  if (!/^[a-z]+$/.test(emailPassword)) {
    issues.push("⚠️ Contains non-lowercase letters (might be correct, but check)");
  }
  
  if (issues.length > 0) {
    console.log("🔍 Issues Found:");
    issues.forEach(issue => console.log("   ", issue));
    console.log("");
  } else {
    console.log("✅ Password format looks correct!");
    console.log("");
  }
}

console.log("🌐 Frontend URL:");
console.log("   ", process.env.FRONTEND_URL || "❌ NOT SET");
console.log("");

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("\n📝 Expected Configuration:");
console.log("   EMAIL_USER: tirtho.kyptronix@gmail.com");
console.log("   EMAIL_PASSWORD: 16 characters, no spaces");
console.log("   Original: kozi ozmn wtzn cuyg");
console.log("   Without spaces: koziozmnwtzncuyg");
console.log("");

if (emailPassword === "koziozmnwtzncuyg") {
  console.log("✅ Password matches expected value!");
} else if (emailPassword) {
  console.log("⚠️ Password doesn't match expected value");
  console.log("   Expected: koziozmnwtzncuyg");
  console.log("   Got:      " + emailPassword);
  console.log("");
  console.log("💡 If this is a new App Password, that's OK!");
  console.log("   Just make sure it's 16 characters without spaces.");
}

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("\n🚀 Next Steps:");
console.log("   1. If issues found, fix them in .env file");
console.log("   2. Restart the server");
console.log("   3. Test with: node test-email.js");
console.log("");
