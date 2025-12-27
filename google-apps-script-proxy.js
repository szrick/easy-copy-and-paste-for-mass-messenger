/**
 * Google Apps Script to serve as a proxy for accessing your private Google Sheet
 *
 * Setup:
 * 1. Go to https://script.google.com/
 * 2. Create a new project
 * 3. Paste this code
 * 4. Click Deploy > New deployment
 * 5. Select type: Web app
 * 6. Execute as: Me
 * 7. Who has access: Anyone
 * 8. Deploy and copy the web app URL
 * 9. Share your Google Sheet with the service account email
 */

const SHEET_ID = '1aFda4AwFWCShI8zS2iEmUob3OWJ-S2JGdPOFUD0h2LM';
const GID = '1059265414'; // Your sheet tab ID

function doGet(e) {
  try {
    // Open the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);

    // Get the specific sheet by GID
    const sheets = spreadsheet.getSheets();
    let targetSheet = null;

    for (let sheet of sheets) {
      if (sheet.getSheetId() == GID) {
        targetSheet = sheet;
        break;
      }
    }

    if (!targetSheet) {
      targetSheet = spreadsheet.getSheets()[0]; // Fallback to first sheet
    }

    // Get all data
    const data = targetSheet.getDataRange().getValues();

    // Convert to CSV format
    const csv = data.map(row => {
      return row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma or quote
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        return cellStr;
      }).join(',');
    }).join('\n');

    // Return CSV with proper headers
    return ContentService
      .createTextOutput(csv)
      .setMimeType(ContentService.MimeType.CSV)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET');

  } catch (error) {
    return ContentService
      .createTextOutput('Error: ' + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// Handle CORS preflight
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
