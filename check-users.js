import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Buyer from './models/Buyer.js';
import Reseller from './models/Reseller.js';
import AdminUser from './models/AdminUser.js';

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ Domainsxchange');

    const buyers = await Buyer.find({});
    const resellers = await Reseller.find({});
    const admins = await AdminUser.find({});

    console.log('=== DATABASE USER CHECK ===');
    console.log('Buyers:', buyers.length);
    console.log('Resellers:', resellers.length);
    console.log('Admins:', admins.length);
    console.log('Total Users:', buyers.length + resellers.length + admins.length);

    if (buyers.length > 0) {
      console.log('\nSample Buyer:');
      console.log(JSON.stringify(buyers[0], null, 2));
    }

    if (resellers.length > 0) {
      console.log('\nSample Reseller:');
      console.log(JSON.stringify(resellers[0], null, 2));
    }

    if (admins.length > 0) {
      console.log('\nSample Admin:');
      console.log(JSON.stringify(admins[0], null, 2));
    }

    if (buyers.length === 0 && resellers.length === 0 && admins.length === 0) {
      console.log('\n❌ No users found in database!');
      console.log('Creating a test admin user...');

      const testAdmin = await AdminUser.create({
        name: 'Test Admin',
        email: 'admin@ Domainsxchange.com',
        password: 'password123',
        role: 'admin'
      });

      console.log('✅ Test admin created:', testAdmin.email);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();