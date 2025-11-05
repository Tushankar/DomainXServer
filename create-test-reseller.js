const mongoose = require('mongoose');
const Reseller = require('./models/Reseller.js');

async function createTestReseller() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/domainx');
    console.log('Connected to database');

    const existing = await Reseller.findOne({ email: 'test@example.com' });
    if (existing) {
      console.log('Test reseller already exists');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      return;
    }

    const testReseller = new Reseller({
      name: 'Test Reseller',
      email: 'test@example.com',
      password: 'password123',
      phone: '+1234567890',
      company: 'Test Company',
      businessType: 'individual',
      isApproved: true,
      username: 'testreseller',
      businessId: 'TEST123',
      portfolioLink: 'https://testreseller.com',
      totalSales: 45200,
      activeDomains: 18
    });

    await testReseller.save();
    console.log('Test reseller created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createTestReseller();