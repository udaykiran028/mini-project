const express = require("express");
const router = express.Router();

router.get("/attendance/:student_id", async (req, res) => {
  try {
    const Student = req.app.get("studentsCollection"); // Get the collection
    const studentId = req.params.student_id.trim(); // Trim whitespace
    console.log("Student ID:", studentId, "| Type:", typeof studentId);

    // Fetch the document containing students array
    const studentsData = await Student.findOne({});

    if (!studentsData || !studentsData.students) {
      return res.status(404).json({ error: "No students found in the database" });
    }

    // Debugging: Check first student
    console.log("First student ID:", studentsData.students[0].Student_ID, "| Type:", typeof studentsData.students[0].Student_ID);

    // Find the student
    const student = studentsData.students.find(s => s.Student_ID.trim() === studentId);
    console.log("Found student:", student); // Log the found student for debugging

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/total-classes', async (req, res) => {
  try {
    const attendance = req.app.get("attendanceCollection"); // Get the collection

    // Fetch the document containing students array
    const attendenceData = await attendance.findOne({});

    if (!attendenceData || !attendenceData.total_classes) {
      return res.status(404).json({ error: "No students found in the database" });
    }

    console.log(attendenceData.total_classes); // Log the found student for debugging
    res.json( {total_classes: attendenceData.total_classes ,success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
);
module.exports = router;