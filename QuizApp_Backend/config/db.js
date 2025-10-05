import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Faculty from '../models/Faculty.js';
dotenv.config();  // Make sure to load the .env file

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://divyanshsvpcet:divyansh9850364491@cluster0.iuiecdm.mongodb.net/");
    console.log('MongoDB connected successfully ');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit with failure
  }
};
// const addFaculty = async () => {
//   try {
//     const name = 'karan';
//     const email = 'karan@gmail.com';
//     const department = 'Computer Science ';
//     const phone = '9699823258';
//     const isAdmin = true;
//     const subjects = ['TOC', 'DAA'];
//     const session = '2025-26';
//     const semester = 'odd';

//     // Hash phone number as password
//     const hashedPassword = await bcrypt.hash(phone, 10);

//     const faculty = new Faculty({
//       name,
//       email,
//       department,
//       phone,
//       password: hashedPassword,
//       isAdmin,
//       subjects,
//       session,
//       semester,
//     });

//     await faculty.save();
//     console.log('✅ Faculty added successfully:', faculty);
//     process.exit(0); // exit after success
//   } catch (err) {
//     console.error('❌ Error adding faculty:', err);
//     process.exit(1); // exit with failure
//   }
// };


// addFaculty();

export default connectDB;