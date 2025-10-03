import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import logo from "../assets/logo.png";
import {
  FaRocket,
  FaCalculator,
  FaAtom,
  FaCode,
  FaStream,
  FaMicrochip,
  FaNetworkWired,
  FaDatabase,
  FaShieldAlt,
  FaLaptopCode,
  FaCloud,
  FaRobot,
  FaPenFancy,
} from "react-icons/fa";

const categories = [
  { name: "Computer Science", icon: <FaRocket size={30} /> },
  { name: "Mathematics", icon: <FaCalculator size={30} /> },
  { name: "Physics", icon: <FaAtom size={30} /> },
  { name: "Algorithms", icon: <FaCode size={30} /> },
  { name: "Data Structures", icon: <FaStream size={30} /> },
  { name: "Operating Systems", icon: <FaMicrochip size={30} /> },
  { name: "Networking", icon: <FaNetworkWired size={30} /> },
  { name: "Databases", icon: <FaDatabase size={30} /> },
  { name: "Cybersecurity", icon: <FaShieldAlt size={30} /> },
  { name: "Web Development", icon: <FaLaptopCode size={30} /> },
  { name: "Cloud Computing", icon: <FaCloud size={30} /> },
  { name: "Artificial Intelligence", icon: <FaRobot size={30} /> },
  { name: "Exams & Aptitude", icon: <FaPenFancy size={30} /> },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen font-sans bg-white text-gray-800">
      {/* Navigation */}
      <nav className="fixed w-full z-30 bg-white backdrop-blur-md text-black px-6 py-4 shadow-lg flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 w-10 rounded bg-white shadow-md" />
          <span className="text-lg font-semibold">
            St. Vincent Pallotti College of Engineering and Technology, Nagpur
          </span>
        </div>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/student-login")}
            className="bg-teal-600 px-4 py-2 rounded text-white hover:bg-teal-500 transition"
          >
            Student Quiz
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/faculty-login")}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Faculty Login
          </motion.button>
          {/* NEW: My Result Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/seeresult")}
            className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
          >
            My Result
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="pt-36 pb-16 text-white flex flex-col items-center text-center px-6"
        style={{
          background: "linear-gradient(to bottom right, #4B0082, #000066)",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-5xl font-bold leading-tight mb-4"
        >
          Ready to test your skills?
          <br />
          <span className="text-teal-300">Play, Compete, and Win Big!</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-lg md:text-xl max-w-3xl mb-8"
        >
          Jump into exciting quizzes across categories. Challenge friends, earn achievements, and climb the leaderboard!
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#14B8A6" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/student-login")}
          className="bg-teal-500 px-6 py-3 text-lg font-semibold rounded-full transition"
        >
          Start Your First Quiz
        </motion.button>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-100 py-12">
        <h2 className="text-3xl font-bold text-center mb-10">Popular Categories</h2>
        <div className="flex flex-wrap justify-center gap-6 px-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
              className="flex flex-col items-center bg-white p-6 rounded-lg shadow cursor-pointer min-w-[120px] transition"
            >
              <div className="mb-2 text-teal-500">{cat.icon}</div>
              <span className="text-md font-medium">{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-gray-300 py-6 px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h4 className="font-bold text-white text-lg">QuizMaster</h4>
          <p>© 2025 QuizMaster. All rights reserved.</p>
        </div>
        <div className="flex gap-4">
          <a href="https://facebook.com/" className="hover:text-white transition">Facebook</a>
          <a href="https://twitter.com/" className="hover:text-white transition">Twitter</a>
          <a href="https://instagram.com/" className="hover:text-white transition">Instagram</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
