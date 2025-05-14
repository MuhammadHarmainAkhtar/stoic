import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const listUsers = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the User model dynamically
    const User = mongoose.model('User');
    
    // List all users
    const users = await User.find().select('+password');
    console.log('Total users:', users.length);
    
    // Print user details
    users.forEach(user => {
      console.log('----------------------------');
      console.log('Username:', user.username);
      console.log('Email:', user.email);
      console.log('Verified:', user.verified);
      console.log('Password hash:', user.password);
      console.log('----------------------------');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
};

listUsers();
