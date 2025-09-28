import React from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "./pallotti_img.png";
import logo from "../assets/logo.png";
import {
  FaUserGraduate,
  FaBuilding,
  FaUsers,
  FaGlobe,
  FaFlag,
  FaUniversity,
} from "react-icons/fa";

const stats = [
  { icon: <FaUserGraduate size={40} />, value: "670+", label: "Students Opted for Internship" },
  { icon: <FaBuilding size={40} />, value: "100+", label: "Companies for Internship" },
  { icon: <FaUsers size={40} />, value: "4000+", label: "Strong Alumni Connect" },
  { icon: <FaGlobe size={40} />, value: "5", label: "Continents" },
  { icon: <FaFlag size={40} />, value: "53", label: "Nations" },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen">
      {/* -------------------- Hero Section -------------------- */}
      <div
        className="relative min-h-screen flex flex-col items-center justify-center text-white"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Animation styles */}
        <style>
          {`
            .stat-card {
              transition: transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1);
              will-change: transform;
            }
            .stat-card:hover {
              transform: rotateY(180deg);
            }
          `}
        </style>

        {/* Navigation */}
        <nav
          className="w-full flex items-center justify-between px-6 py-3 absolute top-0 left-0 z-20"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.1)" }}
        >
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="College Logo"
              className="h-10 w-10 rounded-md object-contain"
              style={{ background: "white" }}
            />
            <span className="text-xl md:text-xl font-semibold text-white">
              St. Vincent Pallotti College of Engineering and Technology, Nagpur
            </span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/student-login")}
              className="bg-teal-400 text-white font-semibold px-4 py-2 rounded hover:text-blue-900 transition shadow-lg"
            >
              Student Login
            </button>
            <button
              onClick={() => navigate("/faculty-login")}
              className="bg-white text-blue-900 font-semibold px-4 py-2 rounded hover:text-black transition shadow-lg"
            >
              Faculty Login
            </button>
          </div>
        </nav>

        {/* Overlays */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-blue-900 bg-opacity-70"></div>
          <div
            className="absolute inset-x-0 bottom-0 h-[400px]"
            style={{ background: "linear-gradient(to top, rgba(0,0,50,0.9), rgba(0,0,50,0))" }}
          ></div>
        </div>

        {/* Header + Stats */}
        <div className="relative z-10 flex flex-col items-start justify-center w-full px-6 ml-40">
          {/* Top header section */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-24 p-4 text-left">
            <div className="flex items-center justify-center bg-white/20 rounded-[20%] p-8 min-w-[80px] min-h-[80px] text-4xl text-white">
              <FaUniversity />
            </div>
            <div className="max-w-3xl text-lg md:text-xl bg-white/10 rounded-lg p-6 text-slate-200 font-semibold">
              St. Vincent Pallotti College of Engineering & Technology was established in 2004 by the Nagpur Pallottine Society. The College is accredited by NAAC with an A grade. It is affiliated to Nagpur University, approved by the Director of Technical Education, Mumbai, and AICTE, Government of India.
            </div>
          </div>
          </div>
          {/* Stats Section */}
          <div className="flex flex-wrap justify-center gap-6 py-8">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="stat-card flex flex-col items-center justify-center text-center bg-white/10 rounded-xl p-6 min-w-[180px] shadow-md m-2"
              >
                <div className="mb-4">{stat.icon}</div>
                <h2 className="text-2xl font-bold">{stat.value}</h2>
                <p className="text-lg text-palegoldenrod font-semibold mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
      
      </div>

      {/* -------------------- About / Vision / Mission Section -------------------- */}
      <div className="w-full bg-blue-950 text-white py-16 px-6 flex flex-col items-center gap-16">
        {/* About Us */}
        <div className="max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">About Us</h2>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            St. Vincent Pallotti College of Engineering & Technology (SVPCET) is committed to providing quality technical education and nurturing innovative minds. Our aim is to empower students with knowledge, skills, and ethical values to become competent professionals.
          </p>
        </div>

        {/* Vision & Mission */}
        <div className="flex flex-col md:flex-row gap-12 w-full max-w-6xl justify-center items-start text-center md:text-left">
          <div className="flex-1 bg-blue-800/50 rounded-lg p-9">
            <h3 className="text-2xl font-semibold mb-2">Vision</h3>
            <p className="text-gray-300 leading-relaxed">
              To develop a knowledge based society with clarity of thoughts and charity at hearts to serve humanity with integrity.
            </p>
          </div>
          <div className="flex-1 bg-blue-800/50 rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-2">Mission</h3>
            <p className="list-disc list-inside text-gray-300 leading-relaxed">
              To empower youth to be technocrats of tomorrow with absolute discipline, quest for knowledge and strong ethos to uphold the spirit of professionalism.
            </p>
          </div>
        </div>
      </div>

      {/* -------------------- Footer -------------------- */}
      <footer className="w-full bg-[#0A0C3F]/95 text-gray-300 py-4 px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left">
          <h4 className="font-bold text-white text-lg mb-2">SVPCET, Nagpur</h4>
          <p>© 2025 St. Vincent Pallotti College of Engineering & Technology. All rights reserved.</p>
        </div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="https://www.facebook.com/stvincentngp/" className="hover:text-white">Facebook</a>
          <a href="https://x.com/techpallottines" className="hover:text-white">Twitter</a>
          <a href="https://www.instagram.com/svpcetnagpur/#" className="hover:text-white">Instagram</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
