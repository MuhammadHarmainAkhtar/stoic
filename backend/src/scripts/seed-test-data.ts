import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import User from '../models/userModel';
import Circle from '../models/circleModel';
import CirclePost, { PostType } from '../models/circlePostModel';
import CircleComment from '../models/circleCommentModel';
import Message, { MessageType } from '../models/messageModel';
import Meeting, { MeetingType } from '../models/meetingModel';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Seed test data
 */
const seedTestData = async () => {
  try {
    console.log('Starting seed process...');
    
    // Fetch existing users and circles
    const existingUsers = await User.find({});
    if (existingUsers.length === 0) {
      throw new Error('No users found in database. Create users first.');
    }
    
    const existingCircles = await Circle.find({});
    if (existingCircles.length === 0) {
      throw new Error('No circles found in database. Create circles first.');
    }
    
    console.log(`Found ${existingUsers.length} users and ${existingCircles.length} circles`);
    
    // Generate circle posts
    console.log('Generating circle posts...');
    const posts = [];
    const postTypes = Object.values(PostType);
    
    for (let i = 0; i < 40; i++) {
      const randomUser = faker.helpers.arrayElement(existingUsers);
      const randomCircle = faker.helpers.arrayElement(existingCircles);
      const isMember = randomCircle.members && randomUser._id && (
        randomCircle.members.some(
          member => member && member.toString() === randomUser._id.toString()
        ) || (randomCircle.guru && randomCircle.guru.toString() === randomUser._id.toString())
      );
      
      // Only create posts for circle members
      if (isMember) {
        const randomType = faker.helpers.arrayElement(postTypes);
        const isAnonymous = Math.random() < 0.2; // 20% chance to be anonymous
        
        // Skip to next iteration if there's an issue with the user or circle data
        if (!randomUser._id || !randomCircle._id) continue;
        
        const post = {
          type: randomType,
          content: randomType === PostType.ASK 
            ? faker.lorem.sentence({ min: 5, max: 20 }) + '?' 
            : faker.lorem.paragraphs({ min: 1, max: 3 }),
          user: randomUser._id,
          circle: randomCircle._id,
          upvotes: [],
          downvotes: [],
          comments: [],
          isAnonymous,
          isArchived: false,
          media: randomType === PostType.IMAGE || randomType === PostType.VIDEO 
            ? [faker.system.filePath()] 
            : [],
          createdAt: faker.date.recent({ days: 30 }),
        };
        
        posts.push(post);
      }
    }
    
    const createdPosts = await CirclePost.create(posts);
    console.log(`Created ${createdPosts.length} posts`);
    
    // Update circles with the new posts
    console.log('Linking posts to circles...');
    for (const post of createdPosts) {
      try {
        if (!post.circle || !post._id) {
          console.warn('Skipping post with missing circle or ID');
          continue;
        }
        await Circle.findByIdAndUpdate(post.circle, {
          $push: { posts: post._id },
        });
      } catch (error) {
        console.error(`Error linking post ${post._id} to circle:`, error);
      }
    }
    
    // Generate comments for posts
    console.log('Generating comments...');
    const comments = [];
    
    for (const post of createdPosts) {
      const randomCircle = await Circle.findById(post.circle);
      if (!randomCircle) continue;
      
      // Get a random circle member to comment
      const validCommenters = existingUsers.filter(user => 
        user._id && randomCircle.members && (
          randomCircle.members.some(member => member && member.toString() === user._id.toString()) || 
          (randomCircle.guru && randomCircle.guru.toString() === user._id.toString())
        )
      );
      
      // Skip if no valid commenters
      if (validCommenters.length === 0) continue;
      
      // Generate 0-5 comments per post
      const commentCount = faker.number.int({ min: 0, max: 5 });
      
      for (let i = 0; i < commentCount; i++) {
        
        if (validCommenters.length === 0) continue;
        
        const randomCommenter = faker.helpers.arrayElement(validCommenters);
        
        const comment = {
          content: faker.lorem.sentences({ min: 1, max: 3 }),
          user: randomCommenter._id,
          post: post._id,
          upvotes: [],
          createdAt: faker.date.recent({ days: 15 }),
        };
        
        comments.push(comment);
      }
    }
    
    const createdComments = await CircleComment.create(comments);
    console.log(`Created ${createdComments.length} comments`);
    
    // Link comments to posts
    console.log('Linking comments to posts...');
    for (const comment of createdComments) {
      try {
        await CirclePost.findByIdAndUpdate(comment.post, {
          $push: { comments: comment._id },
        });
      } catch (error) {
        console.error(`Error linking comment ${comment._id} to post:`, error);
      }
    }
    
    // Add upvotes and downvotes to posts
    console.log('Adding upvotes and downvotes to posts...');
    
    for (const post of createdPosts) {
      const randomCircle = await Circle.findById(post.circle);
      if (!randomCircle) continue;
      
      // Get valid users who can vote (circle members)
      const validVoters = existingUsers.filter(user => 
        user._id && randomCircle.members && (
          randomCircle.members.some(member => member && member.toString() === user._id.toString()) || 
          (randomCircle.guru && randomCircle.guru.toString() === user._id.toString())
        )
      );
      
      if (validVoters.length === 0) continue;
      
      // Add random number of upvotes (0-10)
      const upvoteCount = Math.min(faker.number.int({ min: 0, max: 10 }), validVoters.length);
      const upvoters = upvoteCount > 0 ? faker.helpers.arrayElements(validVoters, upvoteCount) : [];
      
      // Add random number of downvotes (0-5), making sure not to downvote and upvote the same post
      const remainingVoters = validVoters.filter(user => 
        !upvoters.some(upvoter => upvoter._id.toString() === user._id.toString())
      );
      const downvoteCount = Math.min(faker.number.int({ min: 0, max: 5 }), remainingVoters.length);
      const downvoters = downvoteCount > 0 ? faker.helpers.arrayElements(remainingVoters, downvoteCount) : [];
      
      if (upvoters.length > 0) {
        await CirclePost.findByIdAndUpdate(post._id, {
          $addToSet: { upvotes: { $each: upvoters.map(user => user._id) } },
        });
      }
      
      if (downvoters.length > 0) {
        await CirclePost.findByIdAndUpdate(post._id, {
          $addToSet: { downvotes: { $each: downvoters.map(user => user._id) } },
        });
      }
    }
    
    // Add upvotes to comments
    console.log('Adding upvotes to comments...');
    
    for (const comment of createdComments) {
      const post = await CirclePost.findById(comment.post);
      if (!post) continue;
      
      const randomCircle = await Circle.findById(post.circle);
      if (!randomCircle) continue;
      
      // Get valid users who can vote (circle members)
      const validVoters = existingUsers.filter(user => 
        user._id && randomCircle.members && (
          randomCircle.members.some(member => member && member.toString() === user._id.toString()) || 
          (randomCircle.guru && randomCircle.guru.toString() === user._id.toString())
        )
      );
      
      if (validVoters.length === 0) continue;
      
      // Add random number of upvotes (0-5)
      const upvoteCount = Math.min(faker.number.int({ min: 0, max: 5 }), validVoters.length);
      const upvoters = upvoteCount > 0 ? faker.helpers.arrayElements(validVoters, upvoteCount) : [];
      
      if (upvoters.length > 0) {
        await CircleComment.findByIdAndUpdate(comment._id, {
          $addToSet: { upvotes: { $each: upvoters.map(user => user._id) } },
        });
      }
    }
    
    // Add saved posts for users
    console.log('Adding saved posts for users...');
    
    for (const user of existingUsers) {
      // Get posts from circles the user is a member of
      const userCircles = existingCircles.filter(circle => {
        return user._id && circle.members && (
          circle.members.some(member => member && member.toString() === user._id.toString()) || 
          (circle.guru && circle.guru.toString() === user._id.toString())
        );
      }) as Array<typeof Circle.prototype & { _id: mongoose.Types.ObjectId }>;
      
      if (userCircles.length === 0) continue;
      
      const circlePosts = createdPosts.filter(post => 
        userCircles.some(circle => circle._id.toString() === post.circle.toString())
      );
      
      if (circlePosts.length === 0) continue;
      
      // Save 0-5 random posts
      const saveCount = Math.min(faker.number.int({ min: 0, max: 5 }), circlePosts.length);
      const postsToSave = saveCount > 0 ? faker.helpers.arrayElements(circlePosts, saveCount) : [];
      
      if (postsToSave.length > 0) {
        await User.findByIdAndUpdate(user._id, {
          $addToSet: { savedPosts: { $each: postsToSave.map(post => post._id) } },
        });
      }
    }
    
    // Generate meetings for circles
    console.log('Generating meetings...');
    const meetings = [];
    
    for (const circle of existingCircles) {
      // Generate 0-3 meetings per circle
      const meetingCount = faker.number.int({ min: 0, max: 3 });
      
      for (let i = 0; i < meetingCount; i++) {
        const isActive = Math.random() < 0.3; // 30% chance to be active
        const meetingType = faker.helpers.arrayElement(Object.values(MeetingType));
        const futureDate = faker.date.soon({ days: 14 });
        
        // Skip if guru is not defined
        if (!circle.guru) {
          console.warn(`Skipping meeting for circle ${circle._id} - no guru defined`);
          continue;
        }
        
        const meeting = {
          title: faker.lorem.words({ min: 2, max: 5 }),
          description: faker.lorem.paragraph(),
          type: meetingType,
          circle: circle._id,
          creator: circle.guru,
          scheduledFor: futureDate,
          duration: faker.helpers.arrayElement([30, 45, 60, 90]),
          participants: [circle.guru], // Start with guru as participant
          roomId: faker.string.uuid(),
          isActive,
          createdAt: faker.date.recent({ days: 10 }),
        };
        
        // Add random members as participants
        const circleMembers = existingUsers.filter(user => 
          user._id && circle.members && circle.members.some(member => member && member.toString() === user._id.toString())
        );
        
        const participantCount = Math.min(faker.number.int({ min: 0, max: 5 }), circleMembers.length);
        const participants = participantCount > 0 ? faker.helpers.arrayElements(circleMembers, participantCount) : [];
        
        // Add participants to meeting
        if (participants.length > 0) {
          meeting.participants.push(...participants.map(user => user._id));
        }
        
        meetings.push(meeting);
      }
    }
    
    const createdMeetings = await Meeting.create(meetings);
    console.log(`Created ${createdMeetings.length} meetings`);
    
    // Generate messages for circles
    console.log('Generating circle messages...');
    const circleMessages = [];
    
    for (const circle of existingCircles) {
      // Find members of this circle
      const circleMembers = existingUsers.filter(user => 
        user._id && circle.members && (
          circle.members.some(member => member && member.toString() === user._id.toString()) || 
          (circle.guru && circle.guru.toString() === user._id.toString())
        )
      );
      
      if (circleMembers.length <= 1) continue;
      
      // Generate 0-30 messages per circle
      const messageCount = faker.number.int({ min: 0, max: 30 });
      
      for (let i = 0; i < messageCount; i++) {
        const randomSender = faker.helpers.arrayElement(circleMembers);
        // Use random number for message type selection since weightedArrayElement might not be available
        const rand = Math.random();
        let messageType;
        if (rand < 0.9) {
          messageType = MessageType.TEXT;
        } else if (rand < 0.95) {
          messageType = MessageType.IMAGE;
        } else {
          messageType = MessageType.VIDEO;
        }
        
        const message = {
          sender: randomSender._id,
          circle: circle._id,
          type: messageType,
          content: messageType === MessageType.TEXT 
            ? faker.lorem.sentences({ min: 1, max: 3 })
            : faker.system.filePath(), // Simulate a file path for media
          read: Math.random() < 0.7, // 70% chance to be read
          createdAt: faker.date.recent({ days: 20 }),
        };
        
        circleMessages.push(message);
      }
    }
    
    // Generate direct messages between users
    console.log('Generating direct messages between users...');
    const directMessages = [];
    
    // Create 0-20 random direct message pairs
    const messagePairCount = faker.number.int({ min: 0, max: 20 });
    
    for (let i = 0; i < messagePairCount; i++) {
      // Pick two different random users
      const sender = faker.helpers.arrayElement(existingUsers);
      let receiver = faker.helpers.arrayElement(existingUsers);
      
      // Make sure both sender and receiver have valid IDs
      if (!sender._id || !receiver._id) {
        console.warn('Skipping message pair due to invalid user IDs');
        continue;
      }
      
      // Ensure we get two different users
      let attempts = 0;
      while (receiver._id.toString() === sender._id.toString() && attempts < 5) {
        receiver = faker.helpers.arrayElement(existingUsers);
        attempts++;
      }
      
      // Skip if we couldn't find different users
      if (receiver._id.toString() === sender._id.toString()) {
        console.warn('Skipping message pair - could not find different users');
        continue;
      }
      
      // Generate 1-10 messages between these users
      const messageCount = faker.number.int({ min: 1, max: 10 });
      
      for (let j = 0; j < messageCount; j++) {
        // 70% chance the original sender sends the message, 30% chance the receiver responds
        const actualSender = Math.random() < 0.7 ? sender : receiver;
        const actualReceiver = actualSender === sender ? receiver : sender;
        
        // Use random number for message type selection since weightedArrayElement might not be available
        const rand = Math.random();
        let messageType;
        if (rand < 0.9) {
          messageType = MessageType.TEXT;
        } else if (rand < 0.95) {
          messageType = MessageType.IMAGE;
        } else {
          messageType = MessageType.VIDEO;
        }
        
        const message = {
          sender: actualSender._id,
          receiver: actualReceiver._id,
          type: messageType,
          content: messageType === MessageType.TEXT 
            ? faker.lorem.sentences({ min: 1, max: 3 })
            : faker.system.filePath(), // Simulate a file path for media
          read: Math.random() < 0.7, // 70% chance to be read
          createdAt: faker.date.recent({ days: 14 }),
        };
        
        directMessages.push(message);
      }
    }
    
    const allMessages = [...circleMessages, ...directMessages];
    const createdMessages = await Message.create(allMessages);
    console.log(`Created ${createdMessages.length} messages (${circleMessages.length} circle, ${directMessages.length} direct)`);
    
    // Update circle ranks based on engagement
    console.log('Updating circle ranks based on engagement...');
    for (const circle of existingCircles) {
      try {
        if (circle.calculateRank && typeof circle.calculateRank === 'function') {
          await circle.calculateRank();
        } else {
          console.warn(`Circle ${circle._id} does not have a calculateRank method`);
        }
      } catch (error) {
        console.error(`Error calculating rank for circle ${circle._id}:`, error);
      }
    }
    
    console.log('Test data seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding test data:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
};

// Run the seed function
// Add process exit handler for cleaner termination
process.on('SIGINT', async () => {
  console.log('Caught interrupt signal, closing MongoDB connection...');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the seed function
connectDB()
  .then(() => seedTestData())
  .catch(error => {
    console.error('Error in seeding process:', error);
    mongoose.disconnect().then(() => process.exit(1));
  });