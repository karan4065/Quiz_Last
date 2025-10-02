import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiHome,
  FiPlusCircle,
  FiBookOpen,
  FiUsers,
  FiLogOut,
} from "react-icons/fi";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  // Get facultyDetails from location or localStorage
  const [facultyDetails, setFacultyDetails] = useState(() => {
  const fromState = location.state?.facultyDetails;
  const fromStorage = localStorage.getItem("facultyDetails");

  if (fromState) return fromState;

  try {
    return fromStorage ? JSON.parse(fromStorage) : null;
  } catch (err) {
    console.error("Error parsing facultyDetails from localStorage:", err);
    return null;
  }
});


  const [role, setRole] = useState(() => {
    // Default to 'admin' if isAdmin is true, else 'faculty'
    if (facultyDetails?.isAdmin) {
      return facultyDetails?.role || "admin";
    }
    return "faculty";
  });

  const [isLoggedIn, setIsLoggedIn] = useState(!!facultyDetails);

  // Keep role in sync with facultyDetails changes
  useEffect(() => {
    if (facultyDetails?.isAdmin) {
      setRole(facultyDetails.role || "admin");
    } else {
      setRole("faculty");
    }
  }, [facultyDetails]);

  const closeSidebar = () => setIsOpen(false);

  const handleNavClick = (to) => {
    navigate(to, { state: { facultyDetails } });
    closeSidebar();
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);

    // Update facultyDetails with role (used only in frontend)
    const updated = { ...facultyDetails, role: newRole };
    setFacultyDetails(updated);
    localStorage.setItem("facultyDetails", JSON.stringify(updated));

    // Navigate to role-specific dashboard
    navigate(newRole === "admin" ? "/admin-dashboard" : "/dashboard", {
      state: { facultyDetails: updated },
    });
    closeSidebar();
  };

  const logout = () => {
    setFacultyDetails(null);
    setRole(null);
    setIsLoggedIn(false);
    localStorage.removeItem("facultyDetails");
    navigate("/");
  };

  const navItems = [
    {
      name: role === "admin" ? "Faculty Details" : "Dashboard",
      to: role === "admin" ? "/admin-dashboard" : "/dashboard",
      icon: <FiHome />,
    },
    { name: "Create Quiz", to: "/createquiz", icon: <FiPlusCircle /> },
    { name: "My Quiz", to: "/myquiz", icon: <FiBookOpen /> },
    { name: "Student Details", to: "/studentdetails", icon: <FiUsers /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Hamburger Menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 bg-blue-600 text-white rounded-md shadow-md lg:hidden transition hover:scale-105"
      >
        {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-xl border-r border-gray-200 p-6 z-40 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static`}
      >
        <div>
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">
            {role === "admin" ? "Admin Panel" : "Faculty Panel"}
          </h2>

          {/* Faculty Info */}
          <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
            <div>
              <span className="font-semibold text-gray-700">Name:</span>{" "}
              {facultyDetails?.name || "N/A"}
            </div>
            
            <div>
              <span className="font-semibold text-gray-700">Department:</span>{" "}
              {facultyDetails?.department || "N/A"}
            </div>

            {facultyDetails?.isAdmin && (
              <div>
                <span className="font-semibold text-gray-700">Role:</span>{" "}
                <select
                  value={role}
                  onChange={handleRoleChange}
                  className="ml-2 border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-[#243278] "
                >
                  <option value="admin">Admin</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex flex-col gap-2 text-gray-700 font-medium">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.to)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
                  isActive(item.to)
                    ? "bg-[#243278]  text-white shadow-lg"
                    : "hover:text-black hover:shadow-lg"
                }`}
              >
                <span className="text-lg">{item.icon}</span> {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        {isLoggedIn && (
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-md transition transform hover:scale-105 font-semibold shadow-md"
          >
            <FiLogOut className="text-lg" /> Logout
          </button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
