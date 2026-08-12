/**
 * Enhanced Google Apps Script for Mobile-Friendly JW Assignment Messages
 *
 * Setup:
 * 1. Go to https://script.google.com/
 * 2. Create a new project (or open existing one)
 * 3. Paste this code
 * 4. Update SHEET_ID below with your spreadsheet ID
 * 5. Click Deploy > New deployment (or Manage deployments > Edit > Version: New version)
 * 6. Select type: Web app
 * 7. Execute as: Me
 * 8. Who has access: Anyone
 * 9. Deploy and copy the web app URL
 *
 * Usage:
 * - List worksheets: https://script.google.com/.../exec?action=list
 * - Get worksheet data: https://script.google.com/.../exec?sheet=SheetName
 * - Get by GID: https://script.google.com/.../exec?gid=123456
 */

const SHEET_ID = '1aFda4AwFWCShI8zS2iEmUob3OWJ-S2JGdPOFUD0h2LM'; // UPDATE THIS

function doGet(e) {
  try {
    const params = e.parameter || {};
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);

    // Action: List all worksheets
    if (params.action === 'list') {
      return listWorksheets(spreadsheet);
    }

    // Get specific worksheet data
    const targetSheet = getTargetSheet(spreadsheet, params);

    if (!targetSheet) {
      return createErrorResponse('Worksheet not found');
    }

    // Get all data
    const data = targetSheet.getDataRange().getValues();

    // Convert to CSV format
    const csv = data.map(row => {
      return row.map(cell => {
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        return cellStr;
      }).join(',');
    }).join('\n');

    // Return CSV with CORS headers
    return ContentService
      .createTextOutput(csv)
      .setMimeType(ContentService.MimeType.CSV);

  } catch (error) {
    return createErrorResponse(error.toString());
  }
}

/**
 * List all worksheets in the spreadsheet
 */
function listWorksheets(spreadsheet) {
  const sheets = spreadsheet.getSheets();
  const sheetList = sheets.map(sheet => ({
    name: sheet.getName(),
    gid: sheet.getSheetId(),
    index: sheet.getIndex()
  }));

  return ContentService
    .createTextOutput(JSON.stringify(sheetList))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get target sheet based on parameters
 */
function getTargetSheet(spreadsheet, params) {
  const sheets = spreadsheet.getSheets();

  // Try to get by sheet name
  if (params.sheet) {
    for (let sheet of sheets) {
      if (sheet.getName() === params.sheet) {
        return sheet;
      }
    }
  }

  // Try to get by GID
  if (params.gid) {
    for (let sheet of sheets) {
      if (sheet.getSheetId() == params.gid) {
        return sheet;
      }
    }
  }

  // Default to first sheet
  return sheets[0];
}

/**
 * Create error response
 */
function createErrorResponse(message) {
  return ContentService
    .createTextOutput('Error: ' + message)
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Handle CORS preflight requests
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
