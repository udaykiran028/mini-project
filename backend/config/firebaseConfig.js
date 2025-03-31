const admin = require("firebase-admin");
const serviceAccount = require("../firebase-admin-sdk.json"); // Replace with your Firebase credentials

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Firebase Storage Bucket URL
});

const bucket = admin.storage().bucket();
module.exports = bucket;
