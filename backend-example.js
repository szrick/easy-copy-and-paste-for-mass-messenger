/**
 * Example: Google Cloud Function to proxy Google Sheets access
 * This uses your service account securely on the backend
 *
 * Setup:
 * 1. Install: npm install googleapis
 * 2. Deploy to Google Cloud Functions or Vercel
 * 3. Add your service account JSON as environment variable
 * 4. Share the Google Sheet with: sheets-access@maximal-relic-103407.iam.gserviceaccount.com (Viewer access)
 */

const { google } = require('googleapis');

exports.getSheetData = async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // Parse service account credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    // Authenticate
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get sheet data
    const spreadsheetId = '1aFda4AwFWCShI8zS2iEmUob3OWJ-S2JGdPOFUD0h2LM';
    const range = 'Sheet1!A1:Z1000'; // Adjust as needed

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    // Convert to CSV
    const csv = rows.map(row => {
      return row.map(cell => {
        const cellStr = String(cell || '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        return cellStr;
      }).join(',');
    }).join('\n');

    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error fetching sheet data: ' + error.message);
  }
};
