import mongoose from 'mongoose';
import Circle from '../models/circleModel';
import User from '../models/userModel';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stoic');
    console.log('MongoDB connected...');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

const seedCircles = async () => {
  try {
    // Find admin user to be the guru
    const adminUser = await User.findOne({ email: 'admin@stoic.com' });
    
    if (!adminUser) {
      console.log('Admin user not found. Please create an admin user first.');
      return;
    }

    // Delete existing circles
    await Circle.deleteMany({});
    console.log('Deleted existing circles');

    // Sample circle data
    const circleData = [
      {
        name: 'Stoic Warriors',
        image: '/uploads/circles/stoic-warriors.jpg',
        bio: 'A circle for those who practice stoicism in their daily lives.',
        guru: adminUser._id,
        members: [adminUser._id],
        rank: 1,
        isDefault: true,
        description: 'Join us to learn the ancient philosophy of stoicism and apply it to modern challenges.',
        rules: ['Respect all members', 'Stay focused on stoicism', 'Share your experiences'],
        tags: ['philosophy', 'stoicism', 'mindfulness'],
      },
      {
        name: 'Meditation Masters',
        image: '/uploads/circles/meditation.jpg',
        bio: 'Daily meditation practice and mindfulness techniques.',
        guru: adminUser._id,
        members: [adminUser._id],
        rank: 2,
        isDefault: false,
        description: 'A space for those who practice meditation regularly and want to deepen their practice.',
        rules: ['Respect different meditation traditions', 'Share your practice', 'Support beginners'],
        tags: ['meditation', 'mindfulness', 'spirituality'],
      },
      {
        name: 'Ethical Leadership',
        image: '/uploads/circles/leadership.jpg',
        bio: 'Discussing leadership principles based on stoic philosophy.',
        guru: adminUser._id,
        members: [adminUser._id],
        rank: 3,
        isDefault: false,
        description: 'Learn how to lead with virtue, wisdom, and ethical principles.',
        rules: ['Constructive discussions only', 'Share leadership experiences', 'Focus on ethics'],
        tags: ['leadership', 'ethics', 'business'],
      },
      {
        name: 'Resilience Training',
        image: '/uploads/circles/resilience.jpg',
        bio: 'Building mental strength through stoic practices.',
        guru: adminUser._id,
        members: [adminUser._id],
        rank: 4,
        isDefault: false,
        description: 'Learn techniques to build mental resilience and emotional strength in difficult times.',
        rules: ['Respect privacy', 'No judgment', 'Support others in their journey'],
        tags: ['resilience', 'mental-health', 'strength'],
      },
      {
        name: 'Philosophy Book Club',
        image: '/uploads/circles/books.jpg',
        bio: 'Reading and discussing stoic texts and modern philosophy books.',
        guru: adminUser._id,
        members: [adminUser._id],
        rank: 5,
        isDefault: false,
        description: 'Join our monthly book readings and discussions on stoic philosophy and related topics.',
        rules: ['Read the assigned book', 'Participate in discussions', 'Be respectful of others\' interpretations'],
        tags: ['books', 'reading', 'discussion'],
      }
    ];

    // Add circles to database
    const createdCircles = await Circle.insertMany(circleData);
    console.log(`${createdCircles.length} circles created successfully`);

    // Update admin user to join these circles
    const circleIds = createdCircles.map(circle => circle._id);
    
    // Add user to all circles as a member
    await User.findByIdAndUpdate(
      adminUser._id,
      { 
        $set: { 
          joinedCircles: circleIds,
          isGuru: circleIds // Make admin the guru of all circles
        } 
      }
    );

    console.log('Admin user updated to join all circles');
    console.log('Seed completed successfully!');
    
  } catch (error) {
    console.error('Error seeding circles:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the seed function
connectDB()
  .then(() => seedCircles())
  .catch(error => console.error(error));
