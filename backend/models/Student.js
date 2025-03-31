const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    students: [
        {
            Name: { type: String, required: true },
            Student_ID: { type: String, required: true },
            Email: { type: String, required: true },
            Classes: {
                Total: { type: Number, default: 0 },
                Present: { type: Number, default: 0 },
                Absent: { type: Number, default: 0 }
            }
        }
    ]
}, { collection: "studentscollection" });

module.exports = mongoose.model("Student", StudentSchema);
