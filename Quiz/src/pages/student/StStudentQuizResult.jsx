import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import axios from "axios";
import CircularProgressBar from "../faculty/CircularProgressBar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const StStudentQuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pdfRef = useRef();

  const { submissionId, student } = location.state || {};
  const studentId = student?._id;
  const rollNo = student?.studentId;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!submissionId || !studentId) {
    return (
      <div className="text-center text-red-600 mt-10">
        Missing required data. Please go back.
      </div>
    );
  }

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `http://localhost:5000/api/student/result/${submissionId}`,
          { studentId },
          { withCredentials: true }
        );

        if (response.data.success) {
          console.log("Result API Response:", response.data);
          setResult(response.data.data);
        } else {
          console.error("Failed to fetch result:", response.data.message);
        }
      } catch (error) {
        console.error(
          "Error fetching quiz result:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [submissionId, studentId]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!result || result.length === 0)
    return (
      <div className="text-center text-red-600 mt-10">
        Could not load quiz result.
      </div>
    );

  // Calculate overall score
  let totalQuestions = 0;
  let totalCorrect = 0;

  result.forEach((category) => {
    const answers = category.answers || {};
    Object.values(answers).forEach((ans) => {
      totalQuestions += 1;
      totalCorrect += ans.percentage === 100 ? 1 : 0;
    });
  });

  const overallPercentage =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // PDF download
  const handleDownloadPDF = async () => {
    const input = pdfRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${student?.name || "student"}-quiz-result.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-10 space-y-10">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FaDownload className="mr-2" />
          Download PDF
        </button>
      </div>

      <div ref={pdfRef} className="space-y-10">
        {/* Quiz & Student Details */}
        <section className="bg-gray-50 p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {location.state?.quizTitle || "Quiz Result"}
          </h2>
          <div className="space-y-1 text-gray-700">
            <p>
              <strong>Student:</strong> {student?.name} ({rollNo})
            </p>
            <p>
              <strong>Department:</strong> {student?.department} |{" "}
              <strong>Year:</strong> {student?.year}
            </p>
            <p>
              <strong>Email:</strong> {student?.email}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {new Date(
                student?.updatedAt || location.state?.updatedAt
              ).toLocaleString()}
            </p>
          </div>
        </section>

        {/* Overall Score */}
        <section className="flex flex-col items-center space-y-4">
          <CircularProgressBar percentage={overallPercentage} size={100} />
          <p className="text-lg font-semibold text-gray-700">
            Score: {totalCorrect} / {totalQuestions}
          </p>
        </section>

        {/* Category-wise Distribution */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Category-wise Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {result.map((category, idx) => {
              const answers = category.answers || {};
              const answerKeys = Object.keys(answers); // dynamic keys

              return (
                <div
                  key={idx}
                  className="p-6 border rounded-lg shadow-sm bg-gray-50 flex flex-col items-center"
                >
                  <h4 className="font-bold text-gray-700 mb-6 text-lg">
                    {category.category}
                  </h4>

                  <div className="flex justify-center flex-wrap gap-10">
                    {answerKeys.map((key) => (
                      <div key={key} className="flex flex-col items-center">
                        <CircularProgressBar
                          percentage={answers[key]?.percentage || 0}
                          color={answers[key]?.percentage === 100 ? "#22c55e" : "#ef4444"}
                          size={70}
                        />
                        <span className="mt-2 text-sm font-medium text-gray-700">
                          {key} ({answers[key]?.count || 0})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StStudentQuizResult;
