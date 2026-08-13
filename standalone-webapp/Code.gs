/**
 * JW Assignment Message Generator - Complete Standalone Web App
 *
 * This is a COMPLETE solution - everything in one Apps Script!
 *
 * Setup:
 * 1. Go to https://script.google.com/
 * 2. Create new project
 * 3. Create two files:
 *    - Code.gs (this file)
 *    - Page.html (the interface)
 * 4. Update SHEET_ID below
 * 5. Deploy as Web app:
 *    - Execute as: Me
 *    - Who has access: Only myself (for private) OR Anyone (for sharing)
 * 6. Open the web app URL - that's it!
 *
 * Features:
 * - No external websites needed
 * - No URLs to paste
 * - Completely private (if you choose)
 * - Works on mobile
 * - Select worksheet and generate messages
 */

// UPDATE THIS with your spreadsheet ID
const SHEET_ID = '1aFda4AwFWCShI8zS2iEmUob3OWJ-S2JGdPOFUD0h2LM';

/**
 * Serve the web interface
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Page')
    .setTitle('JW Assignment Messages')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Get list of all worksheets
 */
function getWorksheets() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheets = ss.getSheets();

    return {
      success: true,
      worksheets: sheets.map(sheet => ({
        name: sheet.getName(),
        index: sheet.getIndex(),
        sheetId: sheet.getSheetId()
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get data from specific worksheet and generate messages
 */
function generateMessagesForWorksheet(worksheetName) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(worksheetName);

    if (!sheet) {
      return {
        success: false,
        error: 'Worksheet not found: ' + worksheetName
      };
    }

    const data = sheet.getDataRange().getValues();

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
 * FILTER: Only Bible reading (part 3) and Apply Yourself to Field Ministry (parts 4-7)
 * EXCLUDE: Video assignments (视频)
 */
function parseAssignment(entry) {
  if (!entry || entry.trim() === '') {
    return null;
  }

  const text = entry.trim();

  // FILTER: Exclude video assignments
  if (text.includes('视频')) {
    return null; // Skip video assignments
  }

  const match = text.match(/^(\d+)\s+(.+)$/);

  if (!match) {
    return null;
  }

  const partNumber = match[1];

  // FILTER: Only include parts 3, 4, 5, 6, 7
  // Part 3 = Bible reading (brother)
  // Parts 4-7 = Apply Yourself to Field Ministry (student parts)
  // Exclude: Chairman (C), Prayer (P), CBS, and other parts
  const partNum = parseInt(partNumber);
  if (partNum < 3 || partNum > 7) {
    return null; // Skip this part
  }

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

  const text = dateStr.trim();

  // Try to match cross-month pattern: "OCTOBER 26-NOVEMBER 2"
  const crossMonthMatch = text.match(/^([A-Z]+)\s+(\d+)[-–]([A-Z]+)\s+(\d+)$/i);
  if (crossMonthMatch) {
    const month1 = monthMap[crossMonthMatch[1].toUpperCase()] || crossMonthMatch[1];
    const day1 = crossMonthMatch[2];
    const month2 = monthMap[crossMonthMatch[3].toUpperCase()] || crossMonthMatch[3];
    const day2 = crossMonthMatch[4];
    return month1 + day1 + '日-' + month2 + day2 + '日';
  }

  // Try to match single month pattern: "OCTOBER 26-30" or "OCTOBER 26"
  const singleMonthMatch = text.match(/^([A-Z]+)\s+(.+)$/i);
  if (singleMonthMatch) {
    const month = monthMap[singleMonthMatch[1].toUpperCase()] || singleMonthMatch[1];
    const days = singleMonthMatch[2].replace(/–/g, '-');
    return month + days + '日';
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
