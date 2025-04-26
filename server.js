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
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://quizania-site.onrender.com']
}));


// Google Sheets setup
const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: SCOPES,
});

const SHEET_ID = '1EyDOC0Y6UpmVO5oQunRuQTvrKmFcC5IXRm6YkhUavd4';
let sheets;

async function initSheets() {
  const client = await auth.getClient();
  sheets = google.sheets({ version: 'v4', auth: client });
}

initSheets();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post("/submit", async (req, res) => {
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

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          name,
          mobile,
          city,
          referral || "",
          score || 0,
          avgTime || 0,
          "Yes",
          `${timestamp}, ${JSON.stringify(answers)}`
        ]]
      }
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Google Sheets Save Error:", err);
    res.status(500).json({ success: false, error: "Google Sheets error" });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
