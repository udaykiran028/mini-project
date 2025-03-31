const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
    total_classes: { type: Number, default: 0 }, // Keeps track of total classes

    attendance_list: [
        {
            attendance_id: { type: String, required: true },
            lecturer_id: { type: String, required: true },
            subject: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            students_present: [{ type: String }] // List of student IDs
        }
    ]
}, { collection: "attendancecollection" });

module.exports = mongoose.model("Attendance", AttendanceSchema);
