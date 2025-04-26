const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { google } = require('googleapis');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();
// Security middlewares
app.use(helmet());

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://quizania-site.onrender.com']
}));

// Body parser
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Google Sheets setup
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = process.env.SHEET_ID; // Sheet ID should come from .env

let sheets; // Global sheets instance

async function initSheets() {
  try {
    const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: SCOPES,
    });
    const client = await auth.getClient();
    sheets = google.sheets({ version: 'v4', auth: client });
    console.log("✅ Google Sheets connected.");
  } catch (error) {
    console.error("❌ Google Sheets initialization error:", error);
  }
}

initSheets();

// Submit endpoint
app.post("/submit", async (req, res) => {
  const { name, mobile, city, referral, score, avgTime, answers } = req.body;
  const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata" });

  if (!sheets) {
    return res.status(500).json({ success: false, error: "Sheets not initialized" });
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
          "Yes",
          `${timestamp}, ${JSON.stringify(answers || [])}`
        ]]
      }
    });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Google Sheets Save Error:", err.response?.data || err);
    res.status(500).json({ success: false, error: "Google Sheets error" });
  }
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
