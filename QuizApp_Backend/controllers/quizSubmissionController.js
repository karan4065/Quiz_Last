import { request } from "express";
import Quiz from "../models/Quiz.js";
import QuizSubmission from "../models/QuizSubmission.js";
import Student from "../models/Student.js";
import nodemailer from "nodemailer";




// Dynamic category-wise distribution
export const submitQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;
  console.log(req.user)
  const studentId = req.user?._id;
console.log("studenid",studentId)
  console.log("🔹 Incoming submitQuiz request");
  console.log("➡️ quizId:", quizId);
  console.log("➡️ studentId:", studentId);
  console.log("➡️ answers:", answers);

  try {
    // 🔒 Validate student
    if (!studentId) {
      console.warn("⚠️ Unauthorized: studentId missing");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 📝 Validate answers
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      console.warn("⚠️ Invalid answers:", answers);
      return res.status(400).json({ success: false, message: "Answers are required" });
    }

    // 📘 Find quiz
    const quiz = await Quiz.findById(quizId);
    console.log("📘 Quiz found:", quiz ? quiz.title : "NOT FOUND");

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // ✅ Check if already submitted
    const alreadySubmitted = quiz.completed.some(
      (c) => c.student.toString() === studentId.toString()
    );
    console.log("✅ Already submitted?", alreadySubmitted);

    if (alreadySubmitted) {
      return res
        .status(403)
        .json({ success: false, message: "You have already attempted this quiz." });
    }

    // 🏗️ Extract all questions
    const allQuestions = quiz.categories.flatMap((cat) => cat.questions);
    const totalQuestions = allQuestions.length;
    console.log("📊 Total Questions:", totalQuestions);

    let score = 0;

    // 🔍 Evaluate answers
    const answerDetails = answers.map((answer) => {
      const question = allQuestions.find(
        (q) => q._id.toString() === answer.questionId
      );
      if (!question) {
        console.warn("❌ Question not found for answer:", answer);
        return {
          ...answer,
          correctAnswer: null,
          isCorrect: false,
          marksAwarded: 0,
        };
      }

      const correctAnswer = question.answer;
      const marksAwarded = answer.selectedOption === correctAnswer ? 1 : 0;
      score += marksAwarded;

      console.log(
        `🔎 QID: ${answer.questionId}, Selected: ${answer.selectedOption}, Correct: ${correctAnswer}, Awarded: ${marksAwarded}`
      );

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        correctAnswer,
        isCorrect: marksAwarded === 1,
        marksAwarded,
      };
    });

    console.log("✅ Final Score:", score);

    // 📝 Save submission
    const submission = await QuizSubmission.create({
      studentId,
      quizId,
      answers: answers.map((a) => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption,
      })),
      totalMarks: score,
      status: true,
    });

    console.log("📝 Submission saved:", submission._id);

    // 📌 Update quiz completed
    quiz.completed.push({
      student: studentId,
      submittedAt: new Date(),
      score,
    });
    await quiz.save();
    console.log("📌 Quiz.completed updated for student:", studentId);

    // 📧 Send result email
    const student = await Student.findById(studentId);
    console.log("👤 Student found:", student ? student.email : "NOT FOUND");

    if (student && student.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
         auth: {
          user: "bharbatdivyansh1@gmail.com",
          pass: "uejuxvsnsyvotsgg", // Gmail App password
        },
      });

      console.log("📧 Sending email to:", student.email);

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: `Quiz Result: ${quiz.title}`,
        text: `Hi ${student.name},\n\nYou have completed the quiz "${quiz.title}".\nYour Score: ${score} / ${totalQuestions}\n\nThank you for participating!`,
      });

      console.log("✅ Email sent successfully");
    }

    // 🎯 Final response
    res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        score,
        totalQuestions,
        answerDetails,
        submissionId: submission._id,
      },
    });
  } catch (error) {
    console.error("❌ Submit quiz error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};


export const getCategoryDistribution = async (req, res) => {
  const { quizId, studentId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const submission = await QuizSubmission.findOne({ quizId, studentId });
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    const questionCategoryMap = {};
    const questionOptionsMap = {};

    quiz.categories.forEach(cat => {
      cat.questions.forEach(q => {
        questionCategoryMap[q._id.toString()] = cat.category;
        questionOptionsMap[q._id.toString()] = q.options || [];
      });
    });

    const categoryDistribution = {};

    submission.answers.forEach(answer => {
      const questionId = answer.questionId.toString();
      const category = questionCategoryMap[questionId] || 'Uncategorized';
      const selectedOption = answer.selectedOption;

      if (!categoryDistribution[category]) {
        // initialize dynamic options
        categoryDistribution[category] = {};
        questionOptionsMap[questionId].forEach(opt => {
          categoryDistribution[category][opt] = 0;
        });
      }

      if (categoryDistribution[category][selectedOption] !== undefined) {
        categoryDistribution[category][selectedOption] += 1;
      }
    });

    return res.json({ success: true, data: categoryDistribution });

  } catch (err) {
    console.error('Error getting category distribution:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
