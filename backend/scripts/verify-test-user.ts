import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const verifyUser = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the User model dynamically to avoid circular imports
    const User = mongoose.model('User');
    
    // Create a test user with verified status
    const testUser = await User.findOneAndUpdate(
      { email: 'test@example.com' },
      { 
        $set: {
          verified: true,
          // Set a known password directly using bcrypt hash for testing
          password: '$2b$12$jDiTUTldOc9HeEun2scbdOxcjC1RCjsKKQQOAIVZXODm2NKfP7E/.'  // This is "Password123!"
        } 
      },
      { new: true, upsert: true }
    );

    console.log('Test user created/updated:', testUser);
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test user:', error);
    process.exit(1);
  }
};

verifyUser();
