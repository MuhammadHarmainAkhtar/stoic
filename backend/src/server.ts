import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import connectMongo from './lib/mongoose';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

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

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  });