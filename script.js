// DOM Elements
const sheetUrlInput = document.getElementById('sheetUrl');
const loadBtn = document.getElementById('loadBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const messagesContainer = document.getElementById('messagesContainer');
const messagesList = document.getElementById('messagesList');

// State
let assignments = [];

// Event Listeners
loadBtn.addEventListener('click', loadAssignments);
sheetUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loadAssignments();
    }
});

/**
 * Extract Google Sheet ID from URL
 */
function extractSheetId(url) {
    const patterns = [
        /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
        /\/d\/([a-zA-Z0-9-_]+)/,
        /key=([a-zA-Z0-9-_]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

/**
 * Extract GID (sheet tab ID) from URL
 */
function extractGid(url) {
    const gidMatch = url.match(/[#&]gid=([0-9]+)/);
    return gidMatch ? gidMatch[1] : '0';
}

/**
 * Show loading state
 */
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    messagesContainer.classList.add('hidden');
    loadBtn.disabled = true;
}

/**
 * Hide loading state
 */
function hideLoading() {
    loadingIndicator.classList.add('hidden');
    loadBtn.disabled = false;
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    hideLoading();
}

/**
 * Parse CSV data
 */
function parseCSV(text) {
    const lines = text.split('\n');
    const result = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];

            if (char === '"') {
                if (inQuotes && line[j + 1] === '"') {
                    current += '"';
                    j++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        result.push(values);
    }

    return result;
}

/**
 * Convert English date to Chinese format
 * Example: "JANUARY 5-11" → "1月5-11日"
 */
function convertDateToChinese(dateStr) {
    if (!dateStr) return '';

    const monthMap = {
        'JANUARY': '1月',
        'FEBRUARY': '2月',
        'MARCH': '3月',
        'APRIL': '4月',
        'MAY': '5月',
        'JUNE': '6月',
        'JULY': '7月',
        'AUGUST': '8月',
        'SEPTEMBER': '9月',
        'OCTOBER': '10月',
        'NOVEMBER': '11月',
        'DECEMBER': '12月'
    };

    // Handle formats like "JANUARY 5-11" or "JANUARY 26–FEBRUARY 1"
    const parts = dateStr.trim().split(/\s+/);

    if (parts.length >= 2) {
        const month = parts[0].toUpperCase();
        const days = parts[1];

        // Check if it crosses months (e.g., "JANUARY 26–FEBRUARY 1")
        if (parts.length >= 4 && parts[2].toUpperCase() in monthMap) {
            const month1 = monthMap[month] || month;
            const day1 = days.replace(/–/g, '-').split('-')[0];
            const month2 = monthMap[parts[2].toUpperCase()] || parts[2];
            const day2 = parts[3];
            return `${month1}${day1}日-${month2}${day2}日`;
        } else {
            const chineseMonth = monthMap[month] || month;
            const cleanDays = days.replace(/–/g, '-');
            return `${chineseMonth}${cleanDays}日`;
        }
    }

    return dateStr;
}

/**
 * Parse assignment entry
 * Examples: "3 HXQ", "4 Hexiaofan / Lingke", "6 LX"
 * Returns: { partNumber, isBrother, student, assistant }
 */
function parseAssignment(entry) {
    if (!entry || !entry.trim()) {
        return null;
    }

    const text = entry.trim();

    // Match pattern: number followed by space and names
    const match = text.match(/^(\d+)\s+(.+)$/);

    if (!match) {
        return null;
    }

    const partNumber = match[1];
    const namesPart = match[2].trim();

    // Check if it contains "/" for sister assignment
    if (namesPart.includes('/')) {
        const names = namesPart.split('/').map(n => n.trim());
        return {
            partNumber,
            isBrother: false,
            student: names[0] || '',
            assistant: names[1] || ''
        };
    } else {
        return {
            partNumber,
            isBrother: true,
            student: namesPart,
            assistant: null
        };
    }
}

/**
 * Load assignments from Google Sheet
 */
async function loadAssignments() {
    const url = sheetUrlInput.value.trim();

    if (!url) {
        showError('Please enter a Google Sheet URL');
        return;
    }

    let csvUrl;

    // Check if it's a Google Apps Script URL
    if (url.includes('script.google.com/macros')) {
        csvUrl = url;
    }
    // Check if it's already a published CSV URL
    else if (url.includes('/pub?') && url.includes('output=csv')) {
        csvUrl = url;
    }
    // Otherwise, extract sheet ID and construct CSV export URL
    else {
        const sheetId = extractSheetId(url);
        if (!sheetId) {
            showError('Invalid Google Sheet URL. Please check the URL and try again.');
            return;
        }

        const gid = extractGid(url);
        csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    }

    showLoading();

    try {
        const response = await fetch(csvUrl);

        if (!response.ok) {
            throw new Error('Unable to fetch data. Please use: 1) Google Apps Script proxy URL, 2) Published CSV URL (File → Publish to web), or 3) Shared sheet URL (Share → Anyone with the link).');
        }

        const csvText = await response.text();

        // Check if response is an error message from Google Apps Script
        if (csvText.startsWith('Error:')) {
            throw new Error(`Google Apps Script error: ${csvText.substring(7)}`);
        }

        const data = parseCSV(csvText);

        // Filter out completely empty rows
        const nonEmptyData = data.filter(row => row.some(cell => cell && cell.trim()));

        if (nonEmptyData.length < 2) {
            throw new Error(`No data found in the sheet. Received ${nonEmptyData.length} rows. Please check: 1) The sheet has data, 2) The SHEET_ID and GID in your Google Apps Script match your sheet`);
        }

        processAssignments(nonEmptyData);
        hideLoading();
        messagesContainer.classList.remove('hidden');

    } catch (error) {
        showError(error.message || 'Failed to load assignments. Please try again.');
    }
}

/**
 * Process assignments from CSV data
 * First row contains dates for each week (column)
 * Each column represents one week with multiple assignments
 */
function processAssignments(data) {
    assignments = [];

    if (data.length === 0) {
        return;
    }

    // First row contains dates
    const dateRow = data[0];
    const numWeeks = dateRow.length;

    // Process each column (week)
    for (let col = 0; col < numWeeks; col++) {
        const weekDate = dateRow[col];
        const chineseDate = convertDateToChinese(weekDate);

        // Skip if no date
        if (!weekDate || !weekDate.trim()) {
            continue;
        }

        // Process each row in this column (starting from row 1)
        for (let row = 1; row < data.length; row++) {
            const cellValue = data[row][col];

            if (!cellValue || !cellValue.trim()) {
                continue;
            }

            const parsed = parseAssignment(cellValue);

            if (parsed) {
                assignments.push({
                    date: weekDate,
                    chineseDate: chineseDate,
                    partNumber: parsed.partNumber,
                    isBrother: parsed.isBrother,
                    student: parsed.student,
                    assistant: parsed.assistant
                });
            }
        }
    }

    displayMessages();
}

/**
 * Generate message template based on assignment type
 */
function generateMessage(assignment) {
    if (assignment.isBrother) {
        // Brother template
        return `你好👋 ${assignment.student}🧔‍♂️
你有一个新🆕练习🎉🎉

📅：${assignment.chineseDate}
#️⃣：${assignment.partNumber}

请尽快准备，期待🙏
RH`;
    } else {
        // Sister template
        return `你好👋 ${assignment.student}🧔‍♀️
你有一个新🆕练习🎉🎉

📅：${assignment.chineseDate}
#️⃣：${assignment.partNumber}
助：${assignment.assistant}

请尽快准备，期待🙏
RH`;
    }
}

/**
 * Get display title for message card
 */
function getDisplayTitle(assignment) {
    const type = assignment.isBrother ? '🧔‍♂️ Brother' : '🧔‍♀️ Sister';
    const partInfo = `Part ${assignment.partNumber}`;

    if (assignment.isBrother) {
        return `${type} - ${partInfo} - ${assignment.student}`;
    } else {
        return `${type} - ${partInfo} - ${assignment.student} / ${assignment.assistant}`;
    }
}

/**
 * Display messages
 */
function displayMessages() {
    messagesList.innerHTML = '';

    if (assignments.length === 0) {
        messagesList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No assignments found. Please check your sheet format.</p>';
        return;
    }

    assignments.forEach((assignment, index) => {
        const message = generateMessage(assignment);
        const card = createMessageCard(assignment, message, index);
        messagesList.appendChild(card);
    });
}

/**
 * Create message card element
 */
function createMessageCard(assignment, message, index) {
    const card = document.createElement('div');
    card.className = 'message-card';
    card.dataset.index = index;

    const header = document.createElement('div');
    header.className = 'message-header';

    const title = document.createElement('div');
    title.className = 'message-title';
    title.textContent = getDisplayTitle(assignment);

    const icon = document.createElement('div');
    icon.className = 'copy-icon';
    icon.textContent = '📋';

    header.appendChild(title);
    header.appendChild(icon);

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = message;

    card.appendChild(header);
    card.appendChild(content);

    // Add click handler
    card.addEventListener('click', () => copyMessage(card, message));

    return card;
}

/**
 * Copy message to clipboard
 */
async function copyMessage(card, message) {
    try {
        await navigator.clipboard.writeText(message);

        // Visual feedback on card
        card.classList.add('copied');

        // Show notification
        showCopyNotification();

        // Remove copied class after 2 seconds
        setTimeout(() => {
            card.classList.remove('copied');
        }, 2000);

    } catch (error) {
        // Fallback for browsers that don't support clipboard API
        fallbackCopyTextToClipboard(message, card);
    }
}

/**
 * Fallback copy method
 */
function fallbackCopyTextToClipboard(text, card) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
        document.execCommand('copy');
        card.classList.add('copied');
        showCopyNotification();

        setTimeout(() => {
            card.classList.remove('copied');
        }, 2000);
    } catch (error) {
        showError('Failed to copy message');
    }

    document.body.removeChild(textArea);
}

/**
 * Show copy notification
 */
function showCopyNotification() {
    const notification = document.createElement('div');
    notification.className = 'copy-indicator';
    notification.textContent = '✓ 已复制！(Copied!)';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}
