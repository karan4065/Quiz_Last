// middleware/facultyAuth.js
import jwt from "jsonwebtoken";
import Faculty from "../models/Faculty.js"; // your faculty model

export const isFacultyAuthenticated = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token =
      req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not logged in" });
    }

    // Verify token
    const decoded = jwt.verify(token, "divyansh"); // same secret as login

    // Find faculty by ID from token
    const faculty = await Faculty.findById(decoded.id);
    if (!faculty) {
      return res
        .status(401)
        .json({ success: false, message: "Faculty not found" });
    }

    // Attach faculty to request
    req.user = faculty;
    console.log("Faculty authenticated:", req.user.name);

    next();
  } catch (err) {
    console.error("Faculty auth error:", err);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
