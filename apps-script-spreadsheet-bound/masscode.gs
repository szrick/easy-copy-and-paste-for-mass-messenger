/**
 * JW Assignment Message Generator - Container-Bound Script
 *
 * Installation:
 * 1. Open your Google Spreadsheet
 * 2. Click Extensions > Apps Script
 * 3. Delete any existing code
 * 4. Paste this code
 * 5. Save (Ctrl+S)
 * 6. Refresh your spreadsheet
 * 7. A new menu "JW Messages" will appear
 *
 * Usage:
 * Desktop: Click "JW Messages" menu > "Generate Messages"
 * Mobile: Tap ⋮ (three dots) > JW Messages > Generate Messages
 */

/**
 * Runs when spreadsheet opens - adds custom menu
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📋 JW Messages')
    .addItem('📨 Generate Messages', 'showMessageGenerator')
    .addSeparator()
    .addItem('ℹ️ About', 'showAbout')
    .addToUi();
}

/**
 * Show the message generator dialog
 */
function showMessageGenerator() {
  const html = HtmlService.createHtmlOutputFromFile('Dialog')
    .setWidth(400)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, '📨 Generate Assignment Messages');
}

/**
 * Show about dialog
 */
function showAbout() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'JW Assignment Message Generator',
    'Version 1.0\n\n' +
    'Generates Chinese messages for JW meeting assignments.\n\n' +
    'Instructions:\n' +
    '1. Click "JW Messages" > "Generate Messages"\n' +
    '2. Select a worksheet\n' +
    '3. Click "Generate"\n' +
    '4. Tap message to copy\n' +
    '5. Paste in Zangi messenger',
    ui.ButtonSet.OK
  );
}

/**
 * Get list of all worksheets in this spreadsheet
 */
function getWorksheetList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  return sheets.map(sheet => ({
    name: sheet.getName(),
    index: sheet.getIndex(),
    sheetId: sheet.getSheetId()
  }));
}

/**
 * Get data from specific worksheet
 */
function getWorksheetData(worksheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(worksheetName);

  if (!sheet) {
    throw new Error('Worksheet not found: ' + worksheetName);
  }

  const data = sheet.getDataRange().getValues();

  // Convert to CSV-like array
  return data;
}

/**
 * Process assignments and generate messages
 */
function generateMessages(worksheetName) {
  try {
    const data = getWorksheetData(worksheetName);

    if (!data || data.length < 2) {
      return {
        success: false,
        error: 'No data found in worksheet'
      };
    }

    const messages = processAssignments(data);

    return {
      success: true,
      messages: messages,
      count: messages.length
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Process assignments from data array
 */
function processAssignments(data) {
  const assignments = [];

  if (data.length === 0) {
    return assignments;
  }

  // First row contains dates
  const dateRow = data[0];
  const numWeeks = dateRow.length;

  // Process each column (week)
  for (let col = 0; col < numWeeks; col++) {
    const weekDate = dateRow[col];

    if (!weekDate || weekDate.toString().trim() === '') {
      continue;
    }

    const chineseDate = convertDateToChinese(weekDate.toString());

    // Process each row in this column
    for (let row = 1; row < data.length; row++) {
      const cellValue = data[row][col];

      if (!cellValue || cellValue.toString().trim() === '') {
        continue;
      }

      const parsed = parseAssignment(cellValue.toString());

      if (parsed) {
        const message = generateMessage({
          date: weekDate,
          chineseDate: chineseDate,
          partNumber: parsed.partNumber,
          isBrother: parsed.isBrother,
          student: parsed.student,
          assistant: parsed.assistant
        });

        const displayTitle = getDisplayTitle({
          partNumber: parsed.partNumber,
          isBrother: parsed.isBrother,
          student: parsed.student,
          assistant: parsed.assistant
        });

        assignments.push({
          title: displayTitle,
          message: message,
          date: chineseDate,
          part: parsed.partNumber
        });
      }
    }
  }

  return assignments;
}

/**
 * Parse assignment entry
 */
function parseAssignment(entry) {
  if (!entry || entry.trim() === '') {
    return null;
  }

  const text = entry.trim();
  const match = text.match(/^(\d+)\s+(.+)$/);

  if (!match) {
    return null;
  }

  const partNumber = match[1];
  const namesPart = match[2].trim();

  if (namesPart.includes('/')) {
    const names = namesPart.split('/').map(n => n.trim());
    return {
      partNumber: partNumber,
      isBrother: false,
      student: names[0] || '',
      assistant: names[1] || ''
    };
  } else {
    return {
      partNumber: partNumber,
      isBrother: true,
      student: namesPart,
      assistant: null
    };
  }
}

/**
 * Convert English date to Chinese
 */
function convertDateToChinese(dateStr) {
  if (!dateStr) return '';

  const monthMap = {
    'JANUARY': '1月', 'FEBRUARY': '2月', 'MARCH': '3月',
    'APRIL': '4月', 'MAY': '5月', 'JUNE': '6月',
    'JULY': '7月', 'AUGUST': '8月', 'SEPTEMBER': '9月',
    'OCTOBER': '10月', 'NOVEMBER': '11月', 'DECEMBER': '12月'
  };

  const parts = dateStr.trim().split(/\s+/);

  if (parts.length >= 2) {
    const month = parts[0].toUpperCase();
    const days = parts[1];

    if (parts.length >= 4 && monthMap[parts[2].toUpperCase()]) {
      const month1 = monthMap[month] || month;
      const day1 = days.replace(/–/g, '-').split('-')[0];
      const month2 = monthMap[parts[2].toUpperCase()] || parts[2];
      const day2 = parts[3];
      return month1 + day1 + '日-' + month2 + day2 + '日';
    } else {
      const chineseMonth = monthMap[month] || month;
      const cleanDays = days.replace(/–/g, '-');
      return chineseMonth + cleanDays + '日';
    }
  }

  return dateStr;
}

/**
 * Generate message template
 */
function generateMessage(assignment) {
  if (assignment.isBrother) {
    return '你好👋 ' + assignment.student + '🧔‍♂️\n' +
           '你有一个新🆕练习🎉🎉\n\n' +
           '📅：' + assignment.chineseDate + '\n' +
           '#️⃣：' + assignment.partNumber + '\n\n' +
           '请尽快准备，期待🙏\n' +
           'RH';
  } else {
    return '你好👋 ' + assignment.student + '🧔‍♀️\n' +
           '你有一个新🆕练习🎉🎉\n\n' +
           '📅：' + assignment.chineseDate + '\n' +
           '#️⃣：' + assignment.partNumber + '\n' +
           '助：' + assignment.assistant + '\n\n' +
           '请尽快准备，期待🙏\n' +
           'RH';
  }
}

/**
 * Get display title
 */
function getDisplayTitle(assignment) {
  const type = assignment.isBrother ? '🧔‍♂️ Brother' : '🧔‍♀️ Sister';
  const partInfo = 'Part ' + assignment.partNumber;

  if (assignment.isBrother) {
    return type + ' - ' + partInfo + ' - ' + assignment.student;
  } else {
    return type + ' - ' + partInfo + ' - ' + assignment.student + ' / ' + assignment.assistant;
  }
}
