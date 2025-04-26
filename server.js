const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { google } = require('googleapis');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Security middlewares
app.use(helmet());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://quizania-site.onrender.com'
  ]
}));

// Body parser middleware
app.use(bodyParser.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Google Sheets setup
const SHEET_ID = '1EyDOC0Y6UpmVO5oQunRuQTvrKmFcC5IXRm6YkhUavd4';
let sheets;

// Initialize Google Sheets API client
async function initSheets() {
  try {
    const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    sheets = google.sheets({ version: 'v4', auth: client });
    console.log('✅ Google Sheets API initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheets API:', error);
  }
}

initSheets();

// Route to handle quiz submissions
app.post('/submit', async (req, res) => {
  const {
    name,
    mobile,
    city,
    referral,
    score,
    avgTime,
    answers
  } = req.body;

  const timestamp = new Date().toLocaleString();

  if (!sheets) {
    console.error('❌ Google Sheets client not initialized.');
    return res.status(500).json({ success: false, error: 'Google Sheets client not ready' });
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          name || '',
          mobile || '',
          city || '',
          referral || '',
          score || 0,
          avgTime || 0,
          "Yes", // Submitted field
          `${timestamp}, ${JSON.stringify(answers || [])}`
        ]]
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error saving to Google Sheets:', err);
    res.status(500).json({ success: false, error: 'Google Sheets error' });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
