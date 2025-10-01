import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Replace with your auth logic

  const handleLogout = () => {
    // Clear auth tokens or context here
    setIsLoggedIn(false);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main style={{ flexGrow: 1, padding: "20px" }}>
        {/* Your main dashboard content */}
        <h1>Dashboard Content</h1>
      </main>
    </div>
  );
};

export default DashboardLayout;
