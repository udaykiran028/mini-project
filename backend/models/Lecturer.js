const mongoose = require("mongoose");

const LecturerSchema = new mongoose.Schema({
  Lecturers: [
    {
      Lecturer_ID: { type: String, required: true },  // ✅ Match MongoDB field names
      Name: { type: String, required: true },
      Courses_Code: [{ type: String }],
      Email: { type: String, required: true, unique: true, trim: true }  // ✅ Ensure email uniqueness
    }
  ]
}, { collection: "lecturerscollection" });

module.exports = mongoose.model("Lecturer", LecturerSchema);
