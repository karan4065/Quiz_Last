import React, { useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = ({
  isLoggedIn,
  onLogout,
  facultyDetails,
  role,
  onRoleChange,
}) => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const handleLogout = () => {
    onLogout?.();
    navigate("/");
  };

  return (
    <aside
      ref={sidebarRef}
      className="h-screen w-64 bg-white p-6 fixed z-20 flex flex-col justify-between shadow-xl rounded-tr-xl rounded-br-xl border-l-2 border-blue-500"
    >
      <div>
        <h2 className="text-xl font-bold mb-6 border-b border-blue-500 pb-2">
          Faculty Profile
        </h2>
        <div className="space-y-3 text-sm bg-gray-100 p-4 rounded-md shadow-inner">
          <div>
            <span className="font-semibold">Name:</span> {facultyDetails.name}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {facultyDetails.email}
          </div>
          <div>
            <span className="font-semibold">Department:</span>{" "}
            {facultyDetails.department}
          </div>

          {facultyDetails.isAdmin ? (
            <div>
              <span className="font-semibold">Role:</span>{" "}
              <select
                value={role}
                onChange={(e) => onRoleChange(e.target.value)}
                className="ml-2 border border-blue-500 rounded-md px-2 py-1 bg-white text-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
          ) : (
            <div>
              <span className="font-semibold">Role:</span> Faculty
            </div>
          )}
        </div>

        {/* Navigation links */}
        <nav className="mt-8 flex flex-col gap-4 text-blue-700 font-semibold">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "bg-blue-100 rounded px-3 py-2"
                : "hover:bg-blue-50 rounded px-3 py-2"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/createquiz"
            className={({ isActive }) =>
              isActive
                ? "bg-blue-100 rounded px-3 py-2"
                : "hover:bg-blue-50 rounded px-3 py-2"
            }
          >
            Create Quiz
          </NavLink>

          <NavLink
            to="/myquiz"
            className={({ isActive }) =>
              isActive
                ? "bg-blue-100 rounded px-3 py-2"
                : "hover:bg-blue-50 rounded px-3 py-2"
            }
          >
            My Quiz
          </NavLink>

          <NavLink
            to="/studentdetails"
            className={({ isActive }) =>
              isActive
                ? "bg-blue-100 rounded px-3 py-2"
                : "hover:bg-blue-50 rounded px-3 py-2"
            }
          >
            Student Detail
          </NavLink>
        </nav>
      </div>

      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="bg-blue-500 hover:brightness-110 w-full py-2 rounded-md transition font-medium shadow-md mt-6 text-white"
        >
          Logout
        </button>
      )}
    </aside>
  );
};

export default Sidebar;
