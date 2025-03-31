const mongoose = require("mongoose");

const dbName = "facialattendencedb"; // Specify database name separately

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: dbName // Explicitly set the database name
});

const db = mongoose.connection;

db.on("error", (err) => {
    console.error("❌ MongoDB Connection Error:", err);
});

db.once("open", () => {
    console.log(`✅ Connected to MongoDB - Database: ${dbName}`);
});

db.on("disconnected", () => {
    console.warn("⚠️ MongoDB Disconnected");
});

db.on("reconnected", () => {
    console.log("🔄 MongoDB Reconnected");
});

module.exports = mongoose;
