import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import QuizProgress from "../models/QuizProgress.js";
import QuizSubmission from "../models/QuizSubmission.js";
import Papa from "papaparse";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

// ---------------- Add image-based question to existing quiz ----------------
export const addImageQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { category, options, answer, description } = req.body;

    const parsedOptions = typeof options === "string" ? JSON.parse(options) : options;
    if (!parsedOptions || parsedOptions.length !== 4) {
      return res.status(400).json({ success: false, message: "4 options are required" });
    }
    if (!answer || !parsedOptions.includes(answer)) {
      return res.status(400).json({ success: false, message: "Answer must be one of the options" });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "quiz_images" },
          (error, result) => error ? reject(error) : resolve(result.secure_url)
        );
        stream.end(req.file.buffer);
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    let quizCategory = quiz.categories.find(c => c.category === category);
    if (!quizCategory) {
      quiz.categories.push({ category, questions: [] });
      quizCategory = quiz.categories.find(c => c.category === category);
    }

    quizCategory.questions.push({
      question: "",
      description: description || "",
      image: imageUrl,
      options: parsedOptions,
      answer,
    });

    await quiz.save();
    res.status(201).json({ success: true, message: "Image-based question added successfully", data: quiz });

  } catch (err) {
    console.error("Error adding image question:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ---------------- Create quiz with a single image-based question ----------------
// ---------------- Create quiz with image question ----------------
export const createQuizWithImageQuestion = async (req, res) => {
  try {
    const {
      title,
      duration,
      subject,
      category,
      options,
      answer,
      facultyId,
      description,
      limit,
      session,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !duration ||
      !subject ||
      !category ||
      !options ||
      !answer ||
      !facultyId ||
      !limit ||
      !session
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Parse options
    let parsedOptions;
    try {
      parsedOptions = JSON.parse(options);
    } catch (e) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid options format" });
    }

    if (!Array.isArray(parsedOptions) || parsedOptions.length < 2) {
      return res
        .status(400)
        .json({ success: false, message: "At least 2 options are required" });
    }

    if (!parsedOptions.includes(answer)) {
      return res
        .status(400)
        .json({ success: false, message: "Answer must be one of the options" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "quiz_images" },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    // Create new quiz
    const quiz = new Quiz({
      title,
      subject,
      duration,
      limit,
      session,
      createdBy: facultyId,
      categories: [
        {
          category,
          questions: [
            {
              question: "",
              image: uploadResult.secure_url,
              description: description || "",
              options: parsedOptions,
              answer,
              type: "image",
            },
          ],
        },
      ],
    });

    await quiz.save();
    res
      .status(201)
      .json({ success: true, message: "Quiz created with image question", data: quiz });
  } catch (err) {
    console.error("Error in createQuizWithImageQuestion:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ---------------- Create quiz (general) ----------------
export const createQuiz = async (req, res) => {
  try {
    const { title, subject, duration, categories, createdBy } = req.body;
    if (!title || !subject) return res.status(400).json({ success: false, message: "Title and subject required" });
    if (!categories?.length) return res.status(400).json({ success: false, message: "Categories required" });

    const isValid = categories.every(cat =>
      cat.category && cat.questions?.length &&
      cat.questions.every(q => q.question && q.options?.length && q.answer && q.options.includes(q.answer))
    );
    if (!isValid) return res.status(400).json({ success: false, message: "Invalid questions/options" });

    const quiz = new Quiz({ title, subject, duration: duration || 15, categories, createdBy });
    await quiz.save();
    res.status(201).json({ success: true, message: "Quiz created", data: quiz });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Create Quiz via CSV ----------------
export const createQuizByFaculty = async (req, res) => {
  try {
    const { title, subject, facultyId, csvData, duration } = req.body;
    if (!title || !subject || !facultyId || !csvData) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    if (!parsed.data?.length) return res.status(400).json({ success: false, message: "CSV empty/invalid" });

    const categoriesMap = {};
    parsed.data.forEach(row => {
      const category = row.Category || row.category;
      const question = row.Question || row.question;
      const optionsRaw = row.Options || row.options;
      const answer = row.Answer || row.answer;
      if (!category || !question || !optionsRaw || !answer) return;

      const options = optionsRaw.split(",").map(o => o.trim());
      if (!options.includes(answer)) return;

      if (!categoriesMap[category]) categoriesMap[category] = [];
      categoriesMap[category].push({
        _id: new mongoose.Types.ObjectId(),
        question: question.trim(),
        options,
        answer: answer.trim()
      });
    });

    const categories = Object.keys(categoriesMap).map(cat => ({ category: cat, questions: categoriesMap[cat] }));
    const quiz = new Quiz({ title, subject, duration: duration || 15, categories, createdBy: facultyId });
    await quiz.save();

    res.status(201).json({ success: true, message: "Quiz created via CSV", data: quiz });

  } catch (err) {
    console.error("CSV Quiz creation error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- Get quiz and progress ----------------
// export const getQuiz = async (req, res) => {
//   const { quizId } = req.params;
//   const studentId = req.user?._id;
//   if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

//   try {
//     const quiz = await Quiz.findById(quizId).populate("createdBy", "name");
//     if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

//     let progress = await QuizProgress.findOne({ student: studentId, quiz: quizId });

//     if (progress && progress.status === true) {
//       return res.status(403).json({ success: false, message: "You have already attempted this quiz." });
//     }

//     if (!progress) {
//       progress = await QuizProgress.create({
//         student: studentId,
//         quiz: quizId,
//         currentQuestionIndex: 0,
//         answers: [],
//         timeLeft: quiz.duration * 60,
//         completed: false,
//         status: false
//       });
//     }

//     res.json({ success: true, message: "Quiz fetched", data: { quiz, progress } });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// ---------------- Save Progress ----------------



export const getQuiz = async (req, res) => {
  const { quizId } = req.params;
  const studentId = req.user?._id;
  if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const quiz = await Quiz.findById(quizId).populate("createdBy", "name");
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    let progress = await QuizProgress.findOne({ student: studentId, quiz: quizId });

    if (progress && progress.status === true) {
      return res.status(403).json({ success: false, message: "You have already attempted this quiz." });
    }

    if (!progress) {
      progress = await QuizProgress.create({
        student: studentId,
        quiz: quizId,
        currentQuestionIndex: 0,
        answers: [],
        timeLeft: quiz.duration * 60,
        completed: false,
        status: false
      });
    }
    console.log(progress)
    res.json({ success: true, message: "Quiz fetched", data: { quiz, progress } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Save Progress ----------------
export const saveProgress = async (req, res) => {
  const { currentQuestionIndex, answers, timeLeft } = req.body;
  const studentId = req.user._id;
  try {
    let progress = await QuizProgress.findOne({ quiz: req.params.quizId, student: studentId });
    if (!progress) progress = new QuizProgress({ quiz: req.params.quizId, student: studentId });
    progress.currentQuestionIndex = currentQuestionIndex;
    progress.answers = answers;
    progress.timeLeft = timeLeft;
    await progress.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// ---------------- Save Progress ----------------
// export const saveProgress = async (req, res) => {
//   const { currentQuestionIndex, answers, endTime } = req.body;
//   const studentId = req.user._id;
//   try {
//     let progress = await QuizProgress.findOne({ quiz: req.params.quizId, student: studentId });
//     if (!progress) progress = new QuizProgress({ quiz: req.params.quizId, student: studentId });

//     progress.currentQuestionIndex = currentQuestionIndex;
//     progress.answers = answers;
//     progress.endTime = endTime; // <-- Save actual endTime
//     await progress.save();

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// ---------------- Get Quiz Submissions ----------------
export const getQuizSubmissions = async (req, res) => {
  const { quizId } = req.params;
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    const submissions = await QuizSubmission.find({ quizId }).populate("studentId", "name studentId");

    const submissionsWithScore = submissions.map(sub => {
      const correctAnswers = {};
      quiz.categories.forEach(cat => cat.questions.forEach(q => {
        correctAnswers[q._id.toString()] = q.answer;
      }));

      const answersWithScore = sub.answers.map(a => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        score: correctAnswers[a.questionId.toString()] === a.selectedOption ? 1 : 0
      }));

      const totalScore = answersWithScore.reduce((sum, a) => sum + a.score, 0);
      return { _id: sub._id, studentId: sub.studentId, submittedAt: sub.submittedAt, answers: answersWithScore, totalScore };
    });

    res.status(200).json({ success: true, data: submissionsWithScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Delete inactive progress ----------------
export const deleteInactiveProgress = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    await QuizProgress.deleteMany({ completed: false, updatedAt: { $lt: thirtyMinutesAgo } });
  } catch (err) {
    console.error(err);
  }
};

// ---------------- Answer distribution ----------------
export const getQuizAnswerDistribution = async (req, res) => {
  const { quizId, studentId } = req.params;
  try {
    const submission = await QuizSubmission.findOne({ quizId, studentId });
    if (!submission) return res.status(404).json({ success: false, message: "No submission found" });

    const totalAnswers = submission.answers.length;
    const answerCount = {};
    submission.answers.forEach(ans => {
      if (!ans.selectedOption) return;
      answerCount[ans.selectedOption] = (answerCount[ans.selectedOption] || 0) + 1;
    });

    const answerDistribution = {};
    for (let opt in answerCount) {
      answerDistribution[opt] = {
        count: answerCount[opt],
        percentage: totalAnswers > 0 ? ((answerCount[opt] / totalAnswers) * 100).toFixed(2) : 0
      };
    }

    res.json({ success: true, message: "Answer distribution fetched successfully", data: answerDistribution, submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------- Category-wise answer distribution ----------------
export const getCategoryWiseAnswerDistribution = async (req, res) => {
  const { quizId } = req.params;
  try {
    const results = await QuizSubmission.aggregate([
      { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
      { $unwind: "$answers" },
      { $lookup: { from: "quizzes", localField: "quizId", foreignField: "_id", as: "quizDetails" } },
      { $unwind: "$quizDetails" },
      { $unwind: "$quizDetails.categories" },
      { $unwind: "$quizDetails.categories.questions" },
      { $match: { $expr: { $eq: ["$answers.questionId", "$quizDetails.categories.questions._id"] } } },
      { $group: { _id: { category: "$quizDetails.categories.category", selectedOption: "$answers.selectedOption" }, count: { $sum: 1 } } },
      { $group: { _id: "$_id.category", options: { $push: { option: "$_id.selectedOption", count: "$count" } }, total: { $sum: "$count" } } },
      { $project: { category: "$_id", answers: { $arrayToObject: { $map: { input: "$options", as: "opt", in: { k: "$$opt.option", v: { count: "$$opt.count", percentage: { $round: [{ $multiply: [{ $divide: ["$$opt.count", "$total"] }, 100] }, 2] } } } } } } } }
    ]);
    res.json({ success: true, message: "Category-wise answer distribution fetched successfully", data: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------- Category-wise answer distribution for a student ----------------
export const getCategoryWiseAnswerDistributionForStudent = async (req, res) => {
  const { submissionId } = req.params;
  const { studentId } = req.body;
  try {
    const results = await QuizSubmission.aggregate([
  { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
  { $unwind: "$answers" },
  { $lookup: { from: "quizzes", localField: "quizId", foreignField: "_id", as: "quizDetails" } },
  { $unwind: "$quizDetails" },
  { $unwind: "$quizDetails.categories" },
  { $unwind: "$quizDetails.categories.questions" },
  { $match: { $expr: { $eq: ["$answers.questionId", "$quizDetails.categories.questions._id"] } } },
  { $group: { _id: { category: "$quizDetails.categories.category", selectedOption: "$answers.selectedOption" }, count: { $sum: 1 } } },
  { $group: { _id: "$_id.category", options: { $push: { option: "$_id.selectedOption", count: "$count" } }, total: { $sum: "$count" } } },
  {
    $project: {
      _id: 0,
      category: "$_id",
      answers: {
        $arrayToObject: {
          $map: {
            input: "$options",
            as: "opt",
            in: {
              k: "$$opt.option",
              v: {
                count: "$$opt.count",
                percentage: {
                  $cond: [
                    { $eq: ["$total", 0] },
                    0,
                    { $round: [{ $multiply: [{ $divide: ["$$opt.count", "$total"] }, 100] }, 2] }
                  ]
                }
              }
            }
          }
        }
      }
    }
  }
]);

   res.json({ success: true, message: "Category-wise distribution for student fetched successfully", data: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------- Delete quiz ----------------
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    res.json({ success: true, message: "Quiz deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
