import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Buyer from './models/Buyer.js';
import Reseller from './models/Reseller.js';
import AdminUser from './models/AdminUser.js';

dotenv.config();

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/domainx');

    console.log('=== CREATING TEST USERS ===');

    // Check if admin already exists
    let admin = await AdminUser.findOne({ email: 'admin@domainx.com' });
    if (!admin) {
      admin = await AdminUser.create({
        name: 'Super Admin',
        email: 'admin@domainx.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin created:', admin.email);
    } else {
      console.log('ℹ️ Admin already exists:', admin.email);
    }

    // Check if buyers already exist
    let buyer1 = await Buyer.findOne({ email: 'john@example.com' });
    if (!buyer1) {
      buyer1 = await Buyer.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'buyer',
        isActive: true,
        totalDomains: 5,
        totalSpent: 250.00,
        joinDate: new Date()
      });
      console.log('✅ Buyer created:', buyer1.email);
    } else {
      console.log('ℹ️ Buyer already exists:', buyer1.email);
    }

    let buyer2 = await Buyer.findOne({ email: 'jane@example.com' });
    if (!buyer2) {
      buyer2 = await Buyer.create({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'buyer',
        isActive: true,
        totalDomains: 12,
        totalSpent: 750.50,
        joinDate: new Date()
      });
      console.log('✅ Buyer created:', buyer2.email);
    } else {
      console.log('ℹ️ Buyer already exists:', buyer2.email);
    }

    // Check if resellers already exist
    let reseller1 = await Reseller.findOne({ email: 'mike@reseller.com' });
    if (!reseller1) {
      reseller1 = await Reseller.create({
        name: 'Mike Johnson',
        email: 'mike@reseller.com',
        password: 'password123',
        role: 'seller',
        isActive: true,
        company: 'Mike Domains',
        totalDomains: 25,
        totalEarnings: 1250.00,
        joinDate: new Date()
      });
      console.log('✅ Reseller created:', reseller1.email);
    } else {
      console.log('ℹ️ Reseller already exists:', reseller1.email);
    }

    let reseller2 = await Reseller.findOne({ email: 'sarah@reseller.com' });
    if (!reseller2) {
      reseller2 = await Reseller.create({
        name: 'Sarah Wilson',
        email: 'sarah@reseller.com',
        password: 'password123',
        role: 'seller',
        isActive: false, // Inactive user
        company: 'Sarah Domains Co',
        totalDomains: 8,
        totalEarnings: 400.00,
        joinDate: new Date()
      });
      console.log('✅ Reseller created:', reseller2.email);
    } else {
      console.log('ℹ️ Reseller already exists:', reseller2.email);
    }
    console.log('✅ Resellers created:', reseller1.email, reseller2.email);

    console.log('\n=== SUMMARY ===');
    console.log('Total users created: 5');
    console.log('Admins: 1');
    console.log('Buyers: 2');
    console.log('Sellers: 2');

  } catch (error) {
    console.error('❌ Error creating users:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createTestUsers();