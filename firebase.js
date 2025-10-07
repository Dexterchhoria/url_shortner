// firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://urlshortner-f1412-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const database = admin.database();

module.exports = { admin, database };
