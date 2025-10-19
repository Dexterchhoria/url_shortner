// backend.js

const express = require('express');
const path = require('path');
const { admin, database } = require('./firebase_config');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, (err) => {
  if (err) console.error(err);
  else console.log(`🚀 APPLICATION IS RUNNING on port ${PORT}`);
});

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/favicon.ico', (req, res) => res.status(404).send(''));

// -----------------------------------------------------------
// MAIN SHORTENER ROUTE
// -----------------------------------------------------------
app.post('/process', async (req, res) => {
  console.log('📩 POST /process called');
  console.log('📦 Request body:', req.body);
  console.log('📋 Headers:', req.headers);

  const urlRegEx =
    /(http|https):\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  const longurl = req.body.longurl;
  const custom = req.body.custom ? req.body.custom.trim() : '';

  console.log('🔗 Processing URL:', longurl, 'Custom:', custom);

  // Validate URL
  if (!longurl || !longurl.match(urlRegEx)) {
    return res.status(400).json({ message: '❌ Please enter a valid URL' });
  }

  try {
    let shorturl;

    // If user entered a custom alias
    if (custom.length > 0) {
      // Validate custom alias - only alphanumeric and hyphens
      if (!/^[a-zA-Z0-9_-]+$/.test(custom)) {
        return res.status(400).json({
          message: '❌ Custom alias can only contain letters, numbers, hyphens, and underscores.',
        });
      }

      const customRef = database.ref('urls/' + custom);
      const snapshot = await customRef.get();

      if (snapshot.exists()) {
        return res.status(400).json({
          message: '⚠️ Custom alias already taken! Please try another one.',
        });
      }

      shorturl = custom;
      await addDatabaseEntry(shorturl, longurl);
    } else {
      // Generate random alias
      shorturl = new Date().getTime().toString(36);
      await addDatabaseEntry(shorturl, longurl);
    }

    console.log('✅ URL saved:', shorturl);
    return res.status(200).json({
      longurl: longurl,
      shorturl: shorturl,
      message: 'URL shortened successfully!',
    });
  } catch (err) {
    console.error('🔥 Error in /process:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// -----------------------------------------------------------
// REDIRECT ROUTE (handles visiting short URLs)
// -----------------------------------------------------------
app.get('/:shorturl', async (req, res) => {
  const url = req.params.shorturl;
  console.log('🔗 Redirect request for:', url);

  try {
    const snapshot = await database.ref('urls').child(url).get();

    if (snapshot.exists()) {
      const originalURL = snapshot.val();
      console.log('➡️ Redirecting to:', originalURL);
      return res.redirect(originalURL);
    } else {
      console.log('❌ Short URL not found');
      return res.status(404).send('<h2>404 - Short URL not found</h2>');
    }
  } catch (error) {
    console.error('🔥 Error fetching URL:', error);
    return res.status(500).send('Server error');
  }
});

// -----------------------------------------------------------
// Helper function to add entries in Firebase
// -----------------------------------------------------------
function addDatabaseEntry(shorturl, longurl) {
  return database.ref('urls/' + shorturl).set(longurl);
}
