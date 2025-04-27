import express from 'express';
import cors from 'cors';
import connectMongo from './lib/mongoose'; // Importing MongoDB connection
import authRoutes from './routes/authRoutes'; // Example auth routes
import userRoutes from './routes/userRoutes'; // Example user routes (you will define these later)

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests

// Connect to MongoDB (this ensures the DB is connected when the app starts)
connectMongo()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

// Routes
app.use('/api/auth', authRoutes); // Auth routes
app.use('/api/users', userRoutes); // User routes (you'll create these)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
