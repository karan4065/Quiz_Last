import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Papa from "papaparse";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [filteredFaculties, setFilteredFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [formFaculty, setFormFaculty] = useState({
    name: "",
    email: "",
    department: "",
    phone: "",
    isAdmin: false,
    subjects: [""],
    session: "",
    semester: "",
  });
  const [csvFaculties, setCsvFaculties] = useState([]);
  const formRef = useRef();
  const [adminDept, setAdminDept] = useState("");
  const [showFacultyDetails, setShowFacultyDetails] = useState(false); // Toggle state

  // Get admin details
  useEffect(() => {
    const token = localStorage.getItem("facultyDetails");
    if (!token) navigate("/");
    const adminDetails = JSON.parse(token);
    setAdminDept(adminDetails.department);
    setFormFaculty((prev) => ({ ...prev, department: adminDetails.department }));
  }, [navigate]);

  // Fetch faculties
  const fetchFaculties = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/faculty/getall");
      if (res.data.success) {
        const deptFaculties = res.data.data.filter(
          (f) => f.department === adminDept && !f.isAdmin
        );
        setFaculties(deptFaculties);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (adminDept) fetchFaculties();
  }, [adminDept]);

  // Search and session filter
  useEffect(() => {
    let filtered = faculties;

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sessionFilter.trim()) {
      filtered = filtered.filter((f) => f.session === sessionFilter);
    }

    setFilteredFaculties(filtered);
  }, [searchTerm, sessionFilter, faculties]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormFaculty((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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
      if (!formFaculty.session || !formFaculty.semester) {
        alert("Session and Semester are required");
        return;
      }

      if (selectedFaculty) {
        const res = await axios.put(
          `http://localhost:5000/api/faculty/update/${selectedFaculty._id}`,
          formFaculty
        );
        if (res.data.success) {
          alert("Faculty updated successfully!");
          setSelectedFaculty(null);
          fetchFaculties();
        }
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/faculty/register",
          formFaculty
        );
        if (res.data.success) {
          alert("Faculty added successfully!");
          setFormFaculty({
            name: "",
            email: "",
            department: adminDept,
            phone: "",
            isAdmin: false,
            subjects: [""],
            session: "",
            semester: "",
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
      const res = await axios.delete(
        `http://localhost:5000/api/faculty/delete/${id}`
      );
      if (res.data.success) {
        alert("Faculty deleted!");
        setSelectedFaculty(null);
        fetchFaculties();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CSV Upload
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
          department: adminDept,
          phone: row.phone,
          isAdmin: row.isAdmin === "true" || row.isAdmin === true,
          subjects: row.subjects ? row.subjects.split(";") : [],
          session: row.session || "",
          semester: row.semester || "",
          password: row.phone,
        }));
        setCsvFaculties(parsedData);
      },
    });
  };

  const handleCSVSubmit = async () => {
    if (!csvFaculties.length) return alert("Upload CSV first!");
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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setSelectedFaculty(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f5f6fa] font-sans">
      <div className={`flex-grow transition-all duration-300`}>
        <Navbar userName="Admin Dashboard" onProfileClick={toggleSidebar} />

        <main className="p-8 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-[#1d285d]">Faculty Management</h1>

          {/* Search and session filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <input
              type="text"
              placeholder="Search by name/email"
              className="border p-2 rounded-md w-full max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by session (e.g., 2025-2026)"
              className="border p-2 rounded-md w-full max-w-xs"
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
            />
          </div>

          {/* Toggle Button to Show/Hide Faculty Details */}
          <button
            onClick={() => setShowFacultyDetails((prev) => !prev)}
            className="mb-6 px-5 py-2 bg-[#243278] text-white rounded-md hover:bg-[#1b265f] transition"
          >
            {showFacultyDetails ? "Hide Faculty Details" : "Show Faculty Details"}
          </button>

          {/* Conditionally render faculty details table */}
          {showFacultyDetails && (
            <div className="overflow-x-auto rounded-md shadow border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#243278] text-white text-sm text-left">
                  <tr>
                    <th className="px-6 py-3">Sr No</th>
                    <th className="px-6 py-3">Faculty ID</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Session</th>
                    <th className="px-6 py-3">Semester</th>
                    <th className="px-6 py-3">Subjects</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-sm divide-y divide-gray-100">
                  {(searchTerm || sessionFilter ? filteredFaculties : faculties).map(
                    (faculty, index) => (
                      <tr key={faculty._id} className="hover:bg-gray-50">
                        <td className="px-6 py-3">{index + 1}</td>
                        <td className="px-6 py-3 truncate max-w-[120px]" title={faculty._id}>
                          {faculty._id.slice(0, 10)}...
                        </td>
                        <td className="px-6 py-3 font-semibold">{faculty.name}</td>
                        <td className="px-6 py-3 whitespace-normal max-w-xs">{faculty.department}</td>
                        <td className="px-6 py-3 truncate max-w-[180px]" title={faculty.email}>
                          {faculty.email}
                        </td>
                        <td className="px-6 py-3">{faculty.phone}</td>
                        <td className="px-6 py-3">{faculty.session}</td>
                        <td className="px-6 py-3 capitalize">{faculty.semester}</td>
                        <td className="px-6 py-3 truncate max-w-[150px]" title={faculty.subjects.join(", ")}>
                          {faculty.subjects.join(", ")}
                        </td>
                        <td className="px-6 py-3">
                          <button
                            onClick={() => {
                              setSelectedFaculty(faculty);
                              setFormFaculty({
                                name: faculty.name,
                                email: faculty.email,
                                department: faculty.department,
                                phone: faculty.phone,
                                isAdmin: faculty.isAdmin,
                                subjects: faculty.subjects.length ? faculty.subjects : [""],
                                session: faculty.session || "",
                                semester: faculty.semester || "",
                              });
                            }}
                            className="text-[#243278] hover:underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                  {(searchTerm || sessionFilter ? filteredFaculties : faculties).length === 0 && (
                    <tr>
                      <td colSpan="10" className="text-center py-4 text-gray-500 italic">
                        No faculty found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Add/Edit Faculty Form */}
          <div
            ref={formRef}
            className="mt-6 bg-white p-6 shadow-md rounded-md max-w-full mx-auto sticky top-4 z-10"
          >
            <h2 className="text-xl font-semibold mb-4">
              {selectedFaculty ? "Edit Faculty" : "Add New Faculty"}
            </h2>
            <form
              onSubmit={handleAddOrUpdateFaculty}
              className="grid grid-cols-2 gap-4"
              autoComplete="off"
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
                type="email"
                value={formFaculty.email}
                onChange={handleChange}
                required
                className="border p-2 rounded-md"
              />
              <input
                name="department"
                placeholder="Department"
                value={formFaculty.department}
                readOnly
                className="border p-2 rounded-md bg-gray-100 cursor-not-allowed"
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
                name="session"
                placeholder="Session (e.g., 2025-26)"
                value={formFaculty.session}
                onChange={handleChange}
                required
                className="border p-2 rounded-md"
              />
              <input
                name="semester"
                placeholder="Semester (even/odd)"
                value={formFaculty.semester}
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
                    className="border p-2 rounded-md mb-2 w-full"
                  />
                ))}
                <button
                  type="button"
                  onClick={addSubjectField}
                  className="px-3 py-1 bg-white border border-[#243278] text-[#243278] rounded-md  transition"
                >
                  Add Subject
                </button>
              </div>

              <div className="col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#243278] text-white rounded-md hover:bg-[#1b265f] transition"
                >
                  {selectedFaculty ? "Update Faculty" : "Add Faculty"}
                </button>
                {selectedFaculty && (
                  <button
                    type="button"
                    onClick={() => handleDeleteFaculty(selectedFaculty._id)}
                    className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    Delete Faculty
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* CSV Upload */}
          <div className="mt-10 bg-white p-6 rounded-md shadow-md max-w-full mx-auto">
            <h2 className="text-xl font-semibold mb-4">Upload Faculty via CSV</h2>
            <input type="file" accept=".csv" onChange={handleCSVFile} className="mb-4" />
            <button
              onClick={handleCSVSubmit}
              className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Upload CSV
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
