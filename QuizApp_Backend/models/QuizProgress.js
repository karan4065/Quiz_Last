import { Schema, model } from "mongoose";

const QuizProgressSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  quiz: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
  currentQuestionIndex: { type: Number, default: 0 },
  answers: [
    {
      questionId: { type: Schema.Types.ObjectId, required: true },
      selectedOption: { type: String }, // dynamic options
    }
  ],
  timeLeft: { type: Number, default: 15 * 60 }, // seconds
  completed: { type: Boolean, default: false }, // quiz finished
  status: { type: Boolean, default: false } // submitted status
}, { timestamps: true });

const QuizProgress = model("QuizProgress", QuizProgressSchema);

export default QuizProgress;
