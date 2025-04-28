import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import connectMongo from './lib/mongoose';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Express app
const app = express();

// Output important environment variables for debugging (remove in production)
console.log('--------- Environment Check ---------');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MongoDB URI configured:', process.env.MONGODB_URI ? 'Yes' : 'No');
console.log('JWT Secret configured:', process.env.JWT_SECRET ? 'Yes' : 'No');
console.log('Email credentials configured:', process.env.GMAIL_USER ? 'Yes' : 'No');
console.log('------------------------------------');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV !== 'production' ? err.message : undefined
  });
});

// PORT
const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start server
connectMongo()
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit the app if DB connection fails
  });