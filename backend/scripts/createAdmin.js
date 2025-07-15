// Script to create a static admin user in the database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');

const adminEmail = process.env.ADMIN_EMAIL || 'admin@elitestore.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
const adminName = process.env.ADMIN_NAME || 'Admin';

// Use the correct environment variable name
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('Admin user already exists:', adminEmail);
      await mongoose.disconnect();
      process.exit(0);
    }
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      avatar: {
        public_id: 'avatars/admin',
        url: 'https://res.cloudinary.com/demo/image/upload/v1633609870/default_avatar.png',
      },
    });
    console.log('Admin user created:', adminEmail);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();
