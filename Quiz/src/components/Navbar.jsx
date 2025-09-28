import React from "react";
import logo from "../assets/logo.png";

const Navbar = ({ userName, onProfileClick }) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = currentDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-slate-200 text-slate-800 shadow-md">
      {/* Left: Logo and College Info */}
      <div className="flex items-center space-x-3">
        <img src={logo} alt="College Logo" className="h-12 w-12 object-contain" />
        <h1 className="text-lg font-semibold max-w-[300px] md:max-w-full truncate">
          St. Vincent Pallotti College of Engineering and Technology, Nagpur
        </h1>
      </div>

      {/* Right: Profile Click */}
      <div
        onClick={onProfileClick}
        className="text-sm text-right cursor-pointer hover:text-blue-900 transition"
        title="Click to toggle sidebar"
      >
        <p className="font-semibold">{userName}</p>
        <p className="text-xs">{formattedDate} | {formattedTime}</p>
      </div>
    </nav>
  );
};

export default Navbar;
