import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Faculty from '../models/Faculty.js';
dotenv.config();  // Make sure to load the .env file

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/divyanshQuizSystem");
    console.log('MongoDB connected successfully ');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit with failure
  }
};
// const addFaculty = async () => {
//   try {
//     const name = 'Virat';
//     const email = 'virat@gmail.com';
//     const department = 'Computer Science';
//     const phone = '9876543210';
//     const isAdmin = true;
//     const subjects = ['MDM', 'OE'];
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

// // Run the function
// addFaculty();

export default connectDB;