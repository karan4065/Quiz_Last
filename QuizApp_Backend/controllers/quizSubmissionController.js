import { request } from "express";
import Quiz from "../models/Quiz.js";
import QuizSubmission from "../models/QuizSubmission.js";

export const submitQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;
  const studentId = req.user?._id;
 
  try {
    if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!answers || !Array.isArray(answers) || answers.length === 0)
      return res.status(400).json({ success: false, message: "Answers are required" });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    const alreadySubmitted = quiz.completed.some(c => c.student.toString() === studentId.toString());
        console.log(alreadySubmitted)
    if (alreadySubmitted)
      return res.status(403).json({ success: false, message: "You have already attempted this quiz." });
 
    const allQuestions = quiz.categories.flatMap(cat => cat.questions);
    const totalQuestions = allQuestions.length;
    let score = 0;

    const answerDetails = answers.map(answer => {
      const question = allQuestions.find(q => q._id.toString() === answer.questionId);
      if (!question) return { ...answer, correctAnswer: null, isCorrect: false, marksAwarded: 0 };

      const correctAnswer = question.answer;
      const marksAwarded = answer.selectedOption === correctAnswer ? 1 : 0;
      score += marksAwarded;

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        correctAnswer,
        isCorrect: marksAwarded === 1,
        marksAwarded,
      };
    });

    // Save submission
    const submission = await QuizSubmission.create({
      studentId,
      quizId,
      answers: answers.map(a => ({ questionId: a.questionId, selectedOption: a.selectedOption })),
      totalMarks: score,
      status: true,
    });

    // Add student to Quiz.completed
    quiz.completed.push({ student: studentId, submittedAt: new Date(), score });
    await quiz.save();

    // --- Send Email to student ---
    const student = await Student.findById(studentId);
    if (student && student.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "bharbatdivyansh1@gmail.com",
          pass: "uejuxvsnsyvotsgg", // Gmail App password
        },
      });

      await transporter.sendMail({
        from: "bharbatdivyansh1@gmail.com",
        to: student.email,
        subject: `Quiz Result: ${quiz.title}`,
        text: `Hi ${student.name},\n\nYou have completed the quiz "${quiz.title}".\nYour Score: ${score} / ${totalQuestions}\n\nThank you for participating!`,
      });

    }

    res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      data: { score, totalQuestions, answerDetails, submissionId: submission._id },
    });

  } catch (error) {
    console.error("Submit quiz error:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Dynamic category-wise distribution
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
