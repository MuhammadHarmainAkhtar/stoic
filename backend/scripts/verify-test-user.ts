import mongoose, { Document } from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface UserDocument extends Document {
  email: string;
  verified: boolean;
  password: string;
  username?: string;
  bio?: string;
  profilePicture?: string;
}

const verifyUser = async (): Promise<void> => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the User model dynamically to avoid circular imports
    const User = mongoose.model<UserDocument>('User');
    
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
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test user:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

verifyUser();
