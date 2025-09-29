import React, { useState } from 'react';

const initialFacultyState = {
  name: '',
  email: '',
  department: '',
  phone: '',
  address: '',
  password: '',
  isAdmin: false,
};

const AdminDashboard = () => {
  const [faculty, setFaculty] = useState(initialFacultyState);
  const [message, setMessage] = useState('');
  const [csvMessage, setCsvMessage] = useState('');

  // Handle form value changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFaculty((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle single faculty submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch("http://localhost:5000/api/faculty/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faculty),
      });
      const data = await res.json();
      if(res.ok && data.success) {
        setMessage("Faculty added successfully!");
        setFaculty(initialFacultyState);
      } else {
        setMessage(data.message || "Failed to add faculty.");
      }
    } catch (err) {
      setMessage("An error occurred.");
    }
  };

  // Handle CSV upload
  const handleCsvUpload = async (e) => {
    e.preventDefault();
    setCsvMessage('');
    const form = e.target;
    const formData = new FormData(form);
    try {
      const res = await fetch("http://localhost:5000/api/faculty/bulk-upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if(res.ok && data.success) {
        setCsvMessage(`Successfully uploaded ${data.count} faculty records!`);
      } else {
        setCsvMessage(data.message || "Failed to upload CSV.");
      }
    } catch (err) {
      setCsvMessage("An error occurred.");
    }
    form.reset();
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
      <h2>Admin Dashboard</h2>
      <h3>Add New Faculty</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input name="name" placeholder="Name" value={faculty.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={faculty.email} onChange={handleChange} required />
        <input name="department" placeholder="Department" value={faculty.department} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={faculty.phone} onChange={handleChange} required />
        <input name="address" placeholder="Address" value={faculty.address} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={faculty.password} onChange={handleChange} required />
        <label>
          <input type="checkbox" name="isAdmin" checked={faculty.isAdmin} onChange={handleChange} />
          Admin Privileges
        </label>
        <button type="submit">Add Faculty</button>
      </form>
      {message && <p>{message}</p>}

      <h3 style={{ marginTop: 32 }}>Bulk Faculty Upload</h3>
      <form onSubmit={handleCsvUpload} encType="multipart/form-data">
        <input type="file" name="csvFile" accept=".csv" required />
        <button type="submit">Upload CSV</button>
      </form>
      {csvMessage && <p>{csvMessage}</p>}
    </div>
  );
};

export default AdminDashboard;
