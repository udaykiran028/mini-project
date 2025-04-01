const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { spawn } = require("child_process");

const upload = multer({ dest: "uploads/" }); // Save images temporarily
const router = express.Router();

router.post("/upload-attendance", upload.single("image"), async (req, res) => {
    try {
        const { lecturer_id, subject } = req.body;
        const Attendance = req.app.get("attendanceCollection"); // Get attendance collection
        const imagePath = req.file.path; // Local path of uploaded image

        console.log("Processing Image for Attendance...");

        // Call Python script to recognize faces
        const pythonProcess = spawn("python", ["recognize.py", imagePath]);

        let resultData = "";

        pythonProcess.stdout.on("data", (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on("close", async (code) => {
            console.log(`Python process exited with code: ${code}`);

            // Log the raw Python output before parsing JSON
            console.log("Raw Python Output:", resultData);

            try {
                const parsedData = JSON.parse(resultData);
                if (!Array.isArray(parsedData)) {
                    return res.status(500).json({ error: "Invalid response format", success:false });
                }

                const detected_students = parsedData.map(person => person.name); // Extract student IDs
                console.log("Recognized Students:", detected_students);

                // Generate a unique attendance_id
                const attendance_id = `ATT${Math.floor(10000 + Math.random() * 90000)}`;
                console.log("Generated Attendance ID:", attendance_id);

                // Save attendance record to the database

                const updateResult = await Attendance.updateOne(
                    {}, // We assume there's a single document for all attendance records
                    {
                        $inc: { total_classes: 1 }, // Increment total_classes
                        $push: { // Add new attendance to the list
                            attendance_list: {
                                attendance_id: attendance_id,
                                lecturer_id: lecturer_id,
                                subject: subject,
                                timestamp: new Date(),
                            }
                        }
                    },
                    { upsert: true } // If document does not exist, create one
                );
                // Delete the image after processing
                fs.unlinkSync(imagePath);

                // Return response with attendance_id and detected students
                res.json({ attendance_id, detected_students, success:true });

            } catch (error) {
                console.error("JSON Parse Error:", error.message);
                res.status(500).json({ error: `Failed to process image. Invalid JSON response from Python: ${error.message}`,success:false });
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message, success:false });
    }
});

// Route to submit attendance
router.post("/submit-attendance", async (req, res) => {
    try {
        const { attendance_id, students_present } = req.body;
        console.log("Received attendance_id:", attendance_id);
         console.log("Received students_present:", students_present);

        const Attendance = req.app.get("attendanceCollection");
        const Student = req.app.get("studentsCollection");

        console.log("Updating attendance for ID:", attendance_id);

        // Ensure attendance_id is a string and trimmed
        const cleanedAttendanceId = attendance_id.trim();

        // Update Attendance Collection - Using arrayFilters to target the right entry in attendance_list
        const result = await Attendance.updateOne(
            { "attendance_list.attendance_id": cleanedAttendanceId },
            { $addToSet: { "attendance_list.$[elem].students_present": { $each: students_present } } },
            { arrayFilters: [{ "elem.attendance_id": cleanedAttendanceId }] }
        );
        

        console.log("MongoDB Attendance Update Result:", result);

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Attendance ID not found" });
        }

        // Update Student Attendance in Bulk
        const updateResult = await Student.updateOne(
            { "students.Student_ID": { $in: students_present } },  // Match the document
            {
                $inc: {
                    "students.$[elem].Classes.Total": 1,
                    "students.$[elem].Classes.Present": 1
                }
            },
            { arrayFilters: [{ "elem.Student_ID": { $in: students_present } }] }  // Filter students inside the array
        );

        console.log("MongoDB Update Result:", updateResult);


        res.json({ success: true, message: "Attendance updated successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/get-students", async (req, res) => {
    try {
      
    const Student = req.app.get("studentsCollection");

    // Fetch the document containing students array
    const studentsData = await Student.findOne({});

    if (!studentsData || !studentsData.students) {
      return res.status(404).json({ error: "No students found in the database", success:false });
    }
    

    res.json({ success: true, students: studentsData.students, success:true });

    } catch (error) {
        res.status(500).json({ error: error.message, success:false });
    }
});


module.exports = router;
