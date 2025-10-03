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
      default: [],
      required: true,
    },
    session: {
      type: String,
      required: true, // e.g. "2025-26"
      trim: true,
    },
    semester: {
      type: String,
      enum: ["even", "odd"], // restrict only to "even" or "odd"
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one record per faculty per session-semester combination
FacultySchema.index({ email: 1, session: 1, semester: 1 }, { unique: true });

const Faculty = model('Faculty', FacultySchema);

export default Faculty;
