import { Schema, model } from "mongoose";

const QuizSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    default: 30,
  },
  categories: [
    {
      category: {
        type: String,
        required: true,
      },
      questions: [
        {
          _id: { type: Schema.Types.ObjectId, auto: true },
          question: { type: String }, 
          image: { type: String },    
          description:{type:String},
          options: { type: [String], required: true },
          answer: {
            type: String,
            required: true,
            validate: {
              validator: function (v) {
                return this.options.includes(v);
              },
              message: (props) =>
                `${props.value} is not present in options!`,
            },
          },
        },
      ],
    },
  ],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Faculty",
    required: true,
  },
  completed: [
    {
      student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
      score: { type: Number, required: true },
      submittedAt: { type: Date, default: Date.now },
    },
  ],
}, {
  timestamps: true,
});

const Quiz = model("Quiz", QuizSchema);

export default Quiz;
