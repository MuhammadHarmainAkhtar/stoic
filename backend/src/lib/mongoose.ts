import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Find and load the .env.local file
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

// Fallback to alternative locations if needed
if (!process.env.MONGODB_URI) {
  const alternativePaths = [
    path.resolve(__dirname, '../../.env.local'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env')
  ];
  
  for (const altPath of alternativePaths) {
    if (fs.existsSync(altPath)) {
      dotenv.config({ path: altPath });
      break;
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads in dev mode.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectMongo() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectMongo;