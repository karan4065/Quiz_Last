import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar"; // <-- Your sidebar component
import Navbar from "../../components/Navbar"; // <-- Your top navbar

const AddStudent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const facultyDetails =
    location.state?.facultyDetails ||
    JSON.parse(localStorage.getItem("facultyDetails"));

  const [studentFile, setStudentFile] = useState(null);
  const [students, setStudents] = useState([]);

  // Add student form states
  const [addStudentId, setAddStudentId] = useState("");
  const [addName, setAddName] = useState("");
  const [addDepartment, setAddDepartment] = useState("");
  const [addYear, setAddYear] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");

  // Edit student states
  const [editStudentIdInput, setEditStudentIdInput] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [editStudentId, setEditStudentId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const handleFileChange = (e) => setStudentFile(e.target.files[0]);

  const handleStudentUpload = () => {
    if (!studentFile) return alert("Please select a CSV file.");
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvText = e.target.result;
      try {
        const res = await axios.post("http://localhost:5000/api/student/upload-csv", {
          csvData: csvText,
        });
        if (res.data.success) {
          alert("✅ Students uploaded successfully!");
          setStudents([...students, ...res.data.data]);
          setStudentFile(null);
        } else alert("❌ " + res.data.message);
      } catch (err) {
        console.error(err);
        alert("❌ Something went wrong.");
      }
    };
    reader.readAsText(studentFile);
  };

  const handleAddStudent = async () => {
    if (!addStudentId || !addName || !addDepartment || !addYear || !addEmail) {
      return alert("Fill all required fields");
    }
    try {
      const res = await axios.post("http://localhost:5000/api/student/register", {
        studentId: addStudentId,
        name: addName,
        department: addDepartment,
        year: addYear,
        email: addEmail,
        phone: addPhone,
      });
      if (res.data.success) {
        alert("✅ Student added successfully!");
        setStudents([...students, res.data.data]);
        clearAddForm();
      } else alert("❌ " + res.data.message);
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong.");
    }
  };

  const handleFetchStudent = async () => {
    if (!editStudentIdInput) return alert("Enter a Student ID to fetch");
    try {
      const res = await axios.get(`http://localhost:5000/api/student/id/${editStudentIdInput}`);
      if (res.data.success) {
        const stu = res.data.data;
        setEditingStudent(stu);
        setEditStudentId(stu.studentId);
        setEditName(stu.name);
        setEditDepartment(stu.department);
        setEditYear(stu.year);
        setEditEmail(stu.email);
        setEditPhone(stu.phone);
      } else alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("❌ Student not found");
    }
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return alert("Fetch a student first");
    try {
      const res = await axios.put(`http://localhost:5000/api/student/${editingStudent._id}`, {
        studentId: editStudentId,
        name: editName,
        department: editDepartment,
        year: editYear,
        email: editEmail,
        phone: editPhone,
      });
      if (res.data.success) {
        alert("✅ Student updated successfully!");
        setStudents(students.map((stu) => (stu._id === editingStudent._id ? res.data.data : stu)));
        clearEditForm();
      } else alert("❌ " + res.data.message);
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong.");
    }
  };

  const handleDeleteStudent = async () => {
    if (!editingStudent) return alert("Fetch a student first");
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/student/${editingStudent._id}`);
      if (res.data.success) {
        alert("✅ Student deleted!");
        setStudents(students.filter((stu) => stu._id !== editingStudent._id));
        clearEditForm();
      }
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong.");
    }
  };

  const clearAddForm = () => {
    setAddStudentId("");
    setAddName("");
    setAddDepartment("");
    setAddYear("");
    setAddEmail("");
    setAddPhone("");
  };

  const clearEditForm = () => {
    setEditingStudent(null);
    setEditStudentIdInput("");
    setEditStudentId("");
    setEditName("");
    setEditDepartment("");
    setEditYear("");
    setEditEmail("");
    setEditPhone("");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="faculty" facultyDetails={facultyDetails} />

      <div className="flex flex-col flex-1">
        <Navbar
          userName={`Hey, ${facultyDetails?.name || "Faculty"}`}
          onProfileClick={() => navigate(-1)}
        />

        <main className="p-6 bg-gray-50 flex-1">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Manage Students</h2>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - Add Student */}
            <div className="md:w-1/2 w-full">
              <div className="p-5 border rounded-lg shadow bg-white h-full">
                <h3 className="text-lg font-semibold mb-3 text-[#202d6c]">Add Student</h3>
                <div className="space-y-2 mb-3">
                  <input type="text" placeholder="Student ID" value={addStudentId} onChange={(e) => setAddStudentId(e.target.value)} className="border p-2 rounded-md w-full" />
                  <input type="text" placeholder="Name" value={addName} onChange={(e) => setAddName(e.target.value)} className="border p-2 rounded-md w-full" />
                  <input type="text" placeholder="Department" value={addDepartment} onChange={(e) => setAddDepartment(e.target.value)} className="border p-2 rounded-md w-full" />
                  <input type="text" placeholder="Year" value={addYear} onChange={(e) => setAddYear(e.target.value)} className="border p-2 rounded-md w-full" />
                  <input type="email" placeholder="Email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} className="border p-2 rounded-md w-full" />
                  <input type="text" placeholder="Phone" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} className="border p-2 rounded-md w-full" />
                </div>
                <button onClick={handleAddStudent} className="bg-[#202d6c] text-white w-full py-2 rounded hover:bg-[#243278]">Add</button>
              </div>
            </div>

            {/* Right Column - Upload CSV + Update/Delete */}
            <div className="md:w-1/2 w-full flex flex-col gap-6">
              {/* Upload CSV */}
              <div className="p-5 border rounded-lg shadow bg-white">
                <h3 className="text-lg font-semibold mb-3 text-[#202d6c]">Upload Students from CSV</h3>
                <div className="flex flex-col gap-2">
                  <input type="file" accept=".csv" onChange={handleFileChange} className="border p-2 rounded-md w-full" />
                  <button onClick={handleStudentUpload} className="bg-[#243278] text-white py-2 rounded hover:bg-[#293989]">Upload</button>
                </div>
              </div>

              {/* Update/Delete */}
              <div className="p-5 border rounded-lg shadow bg-white">
                <h3 className="text-lg font-semibold mb-3 text-[#202d6c]">Update / Delete Student</h3>
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="Enter Student ID" value={editStudentIdInput} onChange={(e) => setEditStudentIdInput(e.target.value)} className="border p-2 rounded-md flex-1" />
                  <button onClick={handleFetchStudent} className="bg-[#243278] text-white px-4 rounded hover:bg-[#222d66]">Fetch</button>
                </div>

                {editingStudent && (
                  <div className="space-y-2">
                    <input type="text" placeholder="Student ID" value={editStudentId} onChange={(e) => setEditStudentId(e.target.value)} className="border p-2 rounded-md w-full" />
                    <input type="text" placeholder="Name" value={editName} onChange={(e) => setEditName(e.target.value)} className="border p-2 rounded-md w-full" />
                    <input type="text" placeholder="Department" value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)} className="border p-2 rounded-md w-full" />
                    <input type="text" placeholder="Year" value={editYear} onChange={(e) => setEditYear(e.target.value)} className="border p-2 rounded-md w-full" />
                    <input type="email" placeholder="Email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="border p-2 rounded-md w-full" />
                    <input type="text" placeholder="Phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="border p-2 rounded-md w-full" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={handleUpdateStudent} className="bg-yellow-500 text-white flex-1 py-2 rounded hover:bg-yellow-600">Update</button>
                      <button onClick={handleDeleteStudent} className="bg-red-500 text-white flex-1 py-2 rounded hover:bg-red-600">Delete</button>
                      <button onClick={clearEditForm} className="bg-gray-500 text-white flex-1 py-2 rounded hover:bg-gray-600">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddStudent;
