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
    const lines = text.split('\n').filter(line => line.trim());
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
 * Load assignments from Google Sheet
 */
async function loadAssignments() {
    const url = sheetUrlInput.value.trim();

    if (!url) {
        showError('Please enter a Google Sheet URL');
        return;
    }

    const sheetId = extractSheetId(url);
    if (!sheetId) {
        showError('Invalid Google Sheet URL. Please check the URL and try again.');
        return;
    }

    const gid = extractGid(url);
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

    showLoading();

    try {
        const response = await fetch(csvUrl);

        if (!response.ok) {
            throw new Error('Unable to fetch data. Make sure the Google Sheet is publicly accessible (Anyone with the link can view).');
        }

        const csvText = await response.text();
        const data = parseCSV(csvText);

        if (data.length < 2) {
            throw new Error('No data found in the sheet');
        }

        processAssignments(data);
        hideLoading();
        messagesContainer.classList.remove('hidden');

    } catch (error) {
        showError(error.message || 'Failed to load assignments. Please try again.');
    }
}

/**
 * Process assignments from CSV data
 */
function processAssignments(data) {
    const headers = data[0].map(h => h.toLowerCase().trim());
    assignments = [];

    // Find column indices
    const nameCol = findColumnIndex(headers, ['name', 'brother', 'sister', 'participant', 'student']);
    const partCol = findColumnIndex(headers, ['part', 'assignment', 'talk', 'item']);
    const dateCol = findColumnIndex(headers, ['date', 'week', 'meeting date']);
    const timeCol = findColumnIndex(headers, ['time']);
    const detailsCol = findColumnIndex(headers, ['details', 'notes', 'description']);

    // Process each row (skip header)
    for (let i = 1; i < data.length; i++) {
        const row = data[i];

        if (row.length === 0 || !row[nameCol]) {
            continue;
        }

        const assignment = {
            name: row[nameCol] || '',
            part: row[partCol] || '',
            date: row[dateCol] || '',
            time: row[timeCol] || '',
            details: row[detailsCol] || ''
        };

        if (assignment.name && assignment.part) {
            assignments.push(assignment);
        }
    }

    displayMessages();
}

/**
 * Find column index by multiple possible names
 */
function findColumnIndex(headers, possibleNames) {
    for (const name of possibleNames) {
        const index = headers.findIndex(h => h.includes(name));
        if (index !== -1) {
            return index;
        }
    }
    return 0;
}

/**
 * Generate message template
 */
function generateMessage(assignment) {
    let message = `Dear ${assignment.name},\n\n`;
    message += `You have been assigned the following part for the JW meeting:\n\n`;

    if (assignment.date) {
        message += `📅 Date: ${assignment.date}\n`;
    }

    if (assignment.time) {
        message += `🕐 Time: ${assignment.time}\n`;
    }

    message += `📝 Part: ${assignment.part}\n`;

    if (assignment.details) {
        message += `\nDetails: ${assignment.details}\n`;
    }

    message += `\nPlease confirm your availability. Thank you!`;

    return message;
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
    title.textContent = `${assignment.name} - ${assignment.part}`;

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
    notification.textContent = '✓ Copied to clipboard!';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}
