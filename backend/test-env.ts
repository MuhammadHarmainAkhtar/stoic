import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Check if .env.local exists
const envLocalPath = path.resolve(__dirname, '.env.local');
console.log('Looking for .env.local at:', envLocalPath);
console.log('File exists:', fs.existsSync(envLocalPath));

// Try to load it
dotenv.config({ path: envLocalPath });
console.log('MONGODB_URI after loading:', process.env.MONGODB_URI);

// Try alternative .env file
const envPath = path.resolve(__dirname, '.env');
console.log('Looking for .env at:', envPath);
console.log('File exists:', fs.existsSync(envPath));