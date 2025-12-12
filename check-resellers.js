import mongoose from "mongoose";
import Reseller from "./models/Reseller.js";

async function checkResellers() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ Domainsxchange"
    );
    const count = await Reseller.countDocuments();
    console.log("Total resellers in database:", count);

    if (count === 0) {
      console.log("No resellers found. Creating a test reseller...");
      const testReseller = new Reseller({
        name: "Test Reseller",
        email: "test@example.com",
        password: "password123",
        phone: "+1234567890",
        company: "Test Company",
        businessType: "individual",
        isApproved: true, // Set to approved for testing
      });
      await testReseller.save();
      console.log("Test reseller created successfully!");
      console.log("Email: test@example.com");
      console.log("Password: password123");
    } else {
      const resellers = await Reseller.find({}, "name email isApproved");
      console.log("Existing resellers:");
      resellers.forEach((r) =>
        console.log(
          "-",
          r.name,
          r.email,
          r.isApproved ? "(approved)" : "(pending)"
        )
      );
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkResellers();
