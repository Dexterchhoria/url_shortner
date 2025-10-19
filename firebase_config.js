// firebase.js
const admin = require("firebase-admin");

// Use environment variable if available, otherwise fall back to local file
let credential;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // For production (Render) - use environment variable
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  credential = admin.credential.cert(serviceAccount);
} else {
  // For local development - use local file
  const serviceAccount = require("./serviceAccountKey.json");
  credential = admin.credential.cert(serviceAccount);
}

admin.initializeApp({
  credential: credential,
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://urlshortner-f1412-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const database = admin.database();

module.exports = { admin, database };
