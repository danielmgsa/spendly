const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Add CORS middleware
const { google } = require('googleapis');
const app = express();

const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Load your Google service account key
const key = require('./spendly-444216-ae6843652420.json'); // Relative path to your JSON file

// Authenticate Google Sheets API
const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Replace this with your actual Google Sheet ID
const SPREADSHEET_ID = '18D3ABEW4aT2gbTaVocXeADtLOAYZ8ew84NHPNtXVIco';

// API route to save data
app.post('/add-expense', async (req, res) => {
    const { date, category, amount } = req.body;

    try {
        if (!date || !category || !amount) {
            return res.status(400).send({ success: false, error: 'Invalid data provided.' });
        }

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Expenses!A1:C1', // Match the range to your sheet
            valueInputOption: 'RAW',
            requestBody: {
                values: [[date, category, amount]]
            }
        });
        res.send({ success: true, message: 'Expense added successfully!' });
    } catch (err) {
        console.error('Error appending to Google Sheets:', err);
        res.status(500).send({ success: false, error: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
