require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("./config/db");

const studentApp = require("./APIs/student-api");
const lecturerApp = require("./APIs/lecturer-api");

const app = express();
app.use(cors());
app.use(express.json());

app.set("studentsCollection", require("./models/Student"));
app.set("lecturersCollection", require("./models/Lecturer"));
app.set("attendanceCollection", require("./models/Attendance"));


app.post("/checkUserInfo", async (req, res) => {
    try {
        const { email, userType } = req.body;

        if (!email || !userType) {
            return res.status(400).json({ error: "Email and userType are required" });
        }

        let collection;
        if (userType === "lecturer") {
            collection = app.get("lecturersCollection");
        } else if (userType === "student") {
            collection = app.get("studentsCollection");
        } else {
            return res.status(400).json({ error: "Invalid userType" });
        }

        const data = await collection.findOne({});

        let user = null;
        if (userType === "lecturer" && data?.Lecturers) {  
            user = data.Lecturers.find(lecturer => lecturer.Email.trim().toLowerCase() === email.trim().toLowerCase());
        } else if (userType === "student" && data?.students) {
            user = data.students.find(student => student.Email.trim().toLowerCase() === email.trim().toLowerCase());
        }

        if (user) {
            return res.json({ exists: true, data: user });
        } else {
            return res.status(404).json({ exists: false, error: "User not found" });
        }
    } catch (error) {
        console.error("Error checking user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.use("/student-api", studentApp);
app.use("/lecturer-api", lecturerApp);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
