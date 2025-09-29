import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const FacultySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    subjects: {
      type: [String], 
      unique:true,
      default: [],
      required:true,
    },
  },
  {
    timestamps: true,
  }
);

const Faculty = model('Faculty', FacultySchema);

export default Faculty;
