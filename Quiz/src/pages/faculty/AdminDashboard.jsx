import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import Papa from "papaparse";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFaculties, setFilteredFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [formFaculty, setFormFaculty] = useState({
    name: "",
    email: "",
    department: "",
    phone: "",
    password: "",
    isAdmin: false,
    subjects: [""],
  });
  const [csvFaculties, setCsvFaculties] = useState([]); // CSV parsed data
  const cardRef = useRef();

  // Fetch all faculties
  const fetchFaculties = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/faculty");
      if (res.data.success) {
        setFaculties(res.data.data);
        setFilteredFaculties(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching faculties:", err);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  // Filter faculties
  useEffect(() => {
    const filtered = faculties.filter(
      (faculty) =>
        faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFaculties(filtered);
  }, [searchTerm, faculties]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormFaculty((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle subjects (array)
  const handleSubjectChange = (index, value) => {
    const newSubjects = [...formFaculty.subjects];
    newSubjects[index] = value;
    setFormFaculty((prev) => ({ ...prev, subjects: newSubjects }));
  };

  const addSubjectField = () => {
    setFormFaculty((prev) => ({ ...prev, subjects: [...prev.subjects, ""] }));
  };

  // Add Faculty (manual form)
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/faculty/register",
        formFaculty
      );
      if (res.data.success) {
        alert("Faculty added successfully!");
        setFormFaculty({
          name: "",
          email: "",
          department: "",
          phone: "",
          password: "",
          isAdmin: false,
          subjects: [""],
        });
        fetchFaculties();
      }
    } catch (err) {
      console.error("Error adding faculty:", err);
      alert("Failed to add faculty. Check console for details.");
    }
  };

  // CSV Upload: parse only
  const handleCSVFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data.map((row) => ({
          name: row.name,
          email: row.email,
          department: row.department,
          phone: row.phone,
          password: row.password,
          isAdmin: row.isAdmin === "true" || row.isAdmin === true,
          subjects: row.subjects ? row.subjects.split(";") : [],
        }));
        setCsvFaculties(parsedData);
      },
    });
  };

  // CSV Submit: send parsed data to backend
  const handleCSVSubmit = async () => {
    if (csvFaculties.length === 0) {
      alert("Please upload a CSV file first!");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/faculty/upload-csv",
        { faculties: csvFaculties }
      );

      if (res.data.success) {
        alert("CSV uploaded successfully!");
        setCsvFaculties([]);
        fetchFaculties();
      }
    } catch (err) {
      console.error("Error uploading CSV:", err);
      alert("Error uploading CSV");
    }
  };

  // Update Faculty
  const handleUpdateFaculty = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/faculty/${id}`,
        formFaculty
      );
      if (res.data.success) {
        alert("Faculty updated successfully!");
        setSelectedFaculty(null);
        fetchFaculties();
      }
    } catch (err) {
      console.error("Error updating faculty:", err);
    }
  };

  // Delete Faculty
  const handleDeleteFaculty = async (id) => {
    if (!window.confirm("Are you sure you want to delete this faculty?"))
      return;
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/faculty/${id}`
      );
      if (res.data.success) {
        alert("Faculty deleted successfully!");
        setSelectedFaculty(null);
        fetchFaculties();
      }
    } catch (err) {
      console.error("Error deleting faculty:", err);
    }
  };

  // Sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close details card on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setSelectedFaculty(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cardRef]);

  return (
    <div className="flex bg-[#f5f6fa] min-h-screen font-sans text-gray-800">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="h-screen w-1/5 bg-[#243278] text-white p-6 shadow-xl fixed z-20 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-6 border-b pb-2 border-gray-500">
              Admin Panel
            </h2>
            <p className="text-sm">Manage faculties of the institute.</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-[#cd354d] w-full py-2 rounded-md hover:bg-red-600 transition text-sm font-medium shadow-md"
          >
            Logout
          </button>
        </aside>
      )}

      {/* Main Content */}
      <div
        className={`flex-grow transition-all duration-300 ${
          sidebarOpen ? "ml-[20%]" : ""
        }`}
      >
        <Navbar userName="Admin Dashboard" onProfileClick={toggleSidebar} />

        <main className="p-8">
          {!selectedFaculty ? (
            <div>
              <h2 className="text-2xl font-semibold mt-4 text-[#1d285d]">
                Faculty Management
              </h2>

              {/* Add Faculty Form */}
              <form
                onSubmit={handleAddFaculty}
                className="bg-white p-6 shadow-lg rounded-md mt-6 grid grid-cols-2 gap-4"
              >
                <input
                  name="name"
                  placeholder="Name"
                  value={formFaculty.name}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded-md"
                />
                <input
                  name="email"
                  placeholder="Email"
                  value={formFaculty.email}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded-md"
                />
                <input
                  name="department"
                  placeholder="Department"
                  value={formFaculty.department}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded-md"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone No"
                  value={formFaculty.phone}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded-md"
                />

                <input
                type="password"
                  name="password"
                  placeholder="Password"
                  value={formFaculty.password}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded-md"
                />

                {/* Subjects */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Subjects
                  </label>
                  {formFaculty.subjects.map((subj, index) => (
                    <input
                      key={index}
                      value={subj}
                      onChange={(e) =>
                        handleSubjectChange(index, e.target.value)
                      }
                      placeholder={`Subject ${index + 1}`}
                      className="border p-2 rounded-md w-full mt-1"
                      required
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addSubjectField}
                    className="mt-2 text-sm px-3 py-1 bg-gray-200 rounded-md"
                  >
                    + Add Subject
                  </button>
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isAdmin"
                    checked={formFaculty.isAdmin}
                    onChange={handleChange}
                  />
                  <span>Admin Privileges</span>
                </label>

                <button
                  type="submit"
                  className="col-span-2 bg-[#243278] text-white py-2 rounded-md hover:bg-[#1b265f] transition"
                >
                  Add Faculty
                </button>
              </form>

              {/* Upload CSV */}
              <div className="bg-white p-6 shadow-lg rounded-md mt-6">
                <h3 className="text-lg font-semibold mb-2">Upload CSV</h3>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVFile}
                    className="border p-2 rounded-md flex-grow"
                  />
                  <button
                    onClick={handleCSVSubmit}
                    className="bg-[#243278] text-white px-4 py-2 rounded-md hover:bg-[#1b265f] transition"
                  >
                    Submit
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  CSV Format: name, email, department, phone, password, isAdmin, subjects (semicolon separated)
                </p>
              </div>
            </div>
          ) : (
            <div
              ref={cardRef}
              className="border shadow-lg bg-white rounded-md max-w-3xl mx-auto p-8 mt-6"
            >
              {/* Faculty details & update form (can be updated similarly) */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
