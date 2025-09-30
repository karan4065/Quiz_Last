import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { FaTrash, FaEdit } from "react-icons/fa";
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
  const [csvFaculties, setCsvFaculties] = useState([]);
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
      (f) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Handle subjects
  const handleSubjectChange = (index, value) => {
    const newSubjects = [...formFaculty.subjects];
    newSubjects[index] = value;
    setFormFaculty((prev) => ({ ...prev, subjects: newSubjects }));
  };

  const addSubjectField = () => {
    setFormFaculty((prev) => ({ ...prev, subjects: [...prev.subjects, ""] }));
  };

  // Add or update faculty
  const handleAddOrUpdateFaculty = async (e) => {
    e.preventDefault();
    try {
      if (selectedFaculty) {
        // Update
        const res = await axios.put(
          `http://localhost:5000/api/faculty/${selectedFaculty._id}`,
          formFaculty
        );
        if (res.data.success) {
          alert("Faculty updated successfully!");
          setSelectedFaculty(null);
          fetchFaculties();
        }
      } else {
        // Add
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
      }
    } catch (err) {
      console.error(err);
      alert("Error saving faculty.");
    }
  };

  // Delete faculty
  const handleDeleteFaculty = async (id) => {
    if (!window.confirm("Are you sure you want to delete this faculty?")) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/faculty/${id}`);
      if (res.data.success) {
        alert("Faculty deleted!");
        setSelectedFaculty(null);
        fetchFaculties();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CSV upload
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

  const handleCSVSubmit = async () => {
    if (csvFaculties.length === 0) {
      alert("Please upload a CSV first!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/faculty/upload-csv", {
        faculties: csvFaculties,
      });
      if (res.data.success) {
        alert("CSV uploaded successfully!");
        setCsvFaculties([]);
        fetchFaculties();
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading CSV");
    }
  };

  // Sidebar toggle
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Close card on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setSelectedFaculty(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f5f6fa] font-sans">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-64 bg-[#243278] text-white p-6 fixed h-full z-20 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-6 border-b pb-2 border-gray-500">
              Admin Panel
            </h2>
            <p className="text-sm">Manage faculties and roles.</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-red-600 w-full py-2 rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </aside>
      )}

      {/* Main content */}
      <div className={`flex-grow transition-all duration-300 ${sidebarOpen ? "ml-64" : ""}`}>
        <Navbar userName="Admin Dashboard" onProfileClick={toggleSidebar} />

        <main className="p-8">
          <h1 className="text-2xl font-bold mb-4 text-[#1d285d]">Faculty Management</h1>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by name/email"
            className="border p-2 rounded-md mb-4 w-full max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Faculty List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFaculties.map((faculty) => (
              <div
                key={faculty._id}
                className="bg-white p-4 shadow-md rounded-md cursor-pointer hover:shadow-lg"
                onClick={() => {
                  setSelectedFaculty(faculty);
                  setFormFaculty({
                    name: faculty.name,
                    email: faculty.email,
                    department: faculty.department,
                    phone: faculty.phone,
                    password: faculty.password,
                    isAdmin: faculty.isAdmin,
                    subjects: faculty.subjects.length ? faculty.subjects : [""],
                  });
                }}
              >
                <h3 className="font-semibold text-lg text-[#243278]">{faculty.name}</h3>
                <p className="text-sm text-gray-600">{faculty.email}</p>
                <p className="text-sm text-gray-600">
                  Role: {faculty.isAdmin ? "Admin" : "Faculty"}
                </p>
              </div>
            ))}
          </div>

          {/* Selected Faculty / Add Form */}
          <div
            ref={cardRef}
            className="mt-6 bg-white p-6 shadow-md rounded-md max-w-3xl mx-auto"
          >
            <h2 className="text-xl font-semibold mb-4">
              {selectedFaculty ? "Edit Faculty" : "Add New Faculty"}
            </h2>
            <form onSubmit={handleAddOrUpdateFaculty} className="grid grid-cols-2 gap-4">
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
                placeholder="Phone"
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
              <div className="col-span-2">
                <label className="block font-semibold mb-1">Subjects</label>
                {formFaculty.subjects.map((subj, idx) => (
                  <input
                    key={idx}
                    value={subj}
                    onChange={(e) => handleSubjectChange(idx, e.target.value)}
                    placeholder={`Subject ${idx + 1}`}
                    className="border p-2 rounded-md w-full mt-1"
                  />
                ))}
                <button
                  type="button"
                  onClick={addSubjectField}
                  className="mt-2 px-3 py-1 bg-gray-200 rounded-md"
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
                <span>Admin</span>
              </label>
              <div className="col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-[#243278] text-white py-2 px-4 rounded-md hover:bg-[#1b265f] transition"
                >
                  {selectedFaculty ? "Update Faculty" : "Add Faculty"}
                </button>
                {selectedFaculty && (
                  <button
                    type="button"
                    onClick={() => handleDeleteFaculty(selectedFaculty._id)}
                    className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* CSV Upload */}
          <div className="mt-6 bg-white p-6 shadow-md rounded-md max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold mb-2">Upload CSV</h2>
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
              CSV Format: name,email,department,phone,password,isAdmin,subjects (semicolon separated)
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
