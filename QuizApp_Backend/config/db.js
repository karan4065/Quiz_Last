import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();  // Make sure to load the .env file

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/divyanshQuizSystem");
    console.log('MongoDB connected successfully ✅');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit with failure
  }
};

export default connectDB;