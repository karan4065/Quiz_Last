import React, { useContext, useState } from "react";
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
import { AuthContext } from "./AuthContext";

const Sidebar = () => {
  const { facultyDetails, role, isLoggedIn, changeRole, logout } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => setIsOpen(false);

  const handleNavClick = (to) => {
    navigate(to);
    closeSidebar();
  };

  const handleRoleChange = (e) => {
    changeRole(e.target.value);
    navigate(e.target.value === "admin" ? "/admin-dashboard" : "/dashboard");
    closeSidebar();
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 bg-blue-600 text-white rounded-md shadow-md lg:hidden transition hover:scale-105"
      >
        {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-xl border-r border-gray-200 p-6 z-40 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static`}
      >
        <div>
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">
            {role === "admin" ? "Admin Panel" : "Faculty Panel"}
          </h2>

          <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
            <div>
              <span className="font-semibold text-gray-700">Name:</span>{" "}
              {facultyDetails?.name || "N/A"}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Email:</span>{" "}
              {facultyDetails?.email || "N/A"}
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
                  className="ml-2 border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
            )}
          </div>

          <nav className="mt-8 flex flex-col gap-2 text-gray-700 font-medium">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.to)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
                  isActive(item.to)
                    ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg"
                    : "hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:shadow-md"
                }`}
              >
                <span className="text-lg">{item.icon}</span> {item.name}
              </button>
            ))}
          </nav>
        </div>

        {isLoggedIn && (
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-pink-500 hover:to-red-500 py-2 rounded-md transition transform hover:scale-105 font-semibold shadow-md"
          >
            <FiLogOut className="text-lg" /> Logout
          </button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
