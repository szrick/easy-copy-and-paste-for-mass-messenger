# JW Meeting Part Assignment - Zangi Messenger Helper

A simple web application to read JW Meeting Part Assignments from Google Sheets and generate ready-to-copy messages for Zangi messenger.

## Features

- 📊 Read data directly from Google Sheets
- 📋 Automatic message template generation
- 📱 One-click copy to clipboard
- ✅ Visual feedback when messages are copied
- 📨 Ready to paste into Zangi messenger
- 🎨 Clean, modern, and responsive interface

## How to Use

### Step 1: Prepare Your Google Sheet

1. Create a Google Sheet with your JW meeting assignments
2. Include the following columns (column names are flexible):
   - **Name** (or Brother/Sister/Participant/Student)
   - **Part** (or Assignment/Talk/Item)
   - **Date** (or Week/Meeting Date) - Optional
   - **Time** - Optional
   - **Details** (or Notes/Description) - Optional

**Example Sheet Format:**

| Name | Part | Date | Time | Details |
|------|------|------|------|---------|
| John Smith | Bible Reading | Jan 15, 2025 | 7:30 PM | Genesis 1-3 |
| Mary Johnson | Initial Call | Jan 15, 2025 | 7:45 PM | Topic: Kingdom |
| David Brown | Return Visit | Jan 22, 2025 | 7:45 PM | Follow-up on brochure |

### Step 2: Choose Your Access Method

You have three options to connect your Google Sheet:

#### Option A: Google Apps Script Proxy (Recommended for Private Sheets)

This allows you to keep your sheet private and still use the app.

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **New Project**
3. Delete the default code and paste this:

```javascript
const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // Replace with your sheet ID
const GID = '0'; // Replace with your sheet tab ID (usually 0 for first tab)

function doGet(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheets = spreadsheet.getSheets();
    let targetSheet = null;

    for (let sheet of sheets) {
      if (sheet.getSheetId() == GID) {
        targetSheet = sheet;
        break;
      }
    }

    if (!targetSheet) {
      targetSheet = spreadsheet.getSheets()[0];
    }

    const data = targetSheet.getDataRange().getValues();

    const csv = data.map(row => {
      return row.map(cell => {
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        return cellStr;
      }).join(',');
    }).join('\n');

    return ContentService
      .createTextOutput(csv)
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    return ContentService
      .createTextOutput('Error: ' + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
```

4. **Get your SHEET_ID and GID**:
   - Open your Google Sheet
   - Look at the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=GID`
   - Copy the SHEET_ID and GID from the URL
   - Replace them in the script above

5. **Deploy the script**:
   - Click **Deploy** > **New deployment**
   - Click the gear icon ⚙️ > Select **Web app**
   - Fill in:
     - **Description**: "Sheet CSV Proxy"
     - **Execute as**: Me
     - **Who has access**: Anyone
   - Click **Deploy**
   - Click **Authorize access** and grant permissions
   - Copy the **Web app URL** (it will look like `https://script.google.com/macros/s/...`)

6. Use this URL in the application!

#### Option B: Publish to Web (Public CSV)

1. Open your Google Sheet
2. Click **File** > **Share** > **Publish to web**
3. In the dropdown, select the sheet tab you want
4. Change "Web page" to **Comma-separated values (.csv)**
5. Click **Publish**
6. Copy the published URL

#### Option C: Share Publicly

1. Open your Google Sheet
2. Click the **Share** button (top right)
3. Under "General access", select **Anyone with the link**
4. Make sure it's set to **Viewer**
5. Click **Copy link**

### Step 3: Use the Application

1. Open `index.html` in your web browser
2. Paste your Google Sheet URL into the input field
3. Click **Load Assignments**
4. Wait for the messages to be generated

### Step 4: Copy and Send

1. Click on any generated message card
2. The message will be automatically copied to your clipboard
3. You'll see a green checkmark and notification
4. Open Zangi messenger
5. Paste the message (Ctrl+V or Cmd+V)
6. Send to the appropriate person

## Message Template

Each generated message follows this template:

```
Dear [Name],

You have been assigned the following part for the JW meeting:

📅 Date: [Date]
🕐 Time: [Time]
📝 Part: [Part]

Details: [Details]

Please confirm your availability. Thank you!
```

## Customization

### Modify Message Template

To customize the message template, edit the `generateMessage()` function in `script.js`:

```javascript
function generateMessage(assignment) {
    let message = `Dear ${assignment.name},\n\n`;
    // Add your custom message here
    message += `You have been assigned the following part for the JW meeting:\n\n`;
    // ... rest of the template
    return message;
}
```

### Change Styling

All styles are in `styles.css`. You can modify colors, fonts, and layout by editing the CSS variables:

```css
:root {
    --primary-color: #4a90e2;
    --success-color: #52c41a;
    --error-color: #f5222d;
    /* ... more variables */
}
```

## Troubleshooting

### "Invalid Google Sheet URL" Error
- Make sure you're using the full Google Sheets URL
- The URL should look like: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=0`

### "Unable to fetch data" Error
- Ensure your Google Sheet is set to "Anyone with the link can view"
- Check that you have an active internet connection
- Try opening the sheet URL in a new browser tab to verify it's accessible

### No Messages Generated
- Check that your sheet has data in rows (not just headers)
- Verify that you have at least "Name" and "Part" columns
- Make sure column headers are in the first row

### Copy Not Working
- Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Some browsers require HTTPS for clipboard API to work
- The fallback method should work in older browsers

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with JavaScript enabled

## Privacy & Security

- All processing happens in your browser
- No data is sent to any server (except fetching from Google Sheets)
- Your sheet data is not stored or logged anywhere
- The application works completely offline after loading (except for fetching sheet data)

## Technical Details

- **No dependencies** - Pure HTML, CSS, and JavaScript
- **No backend required** - Runs entirely in the browser
- **No installation needed** - Just open the HTML file
- Uses Google Sheets CSV export for data fetching
- Clipboard API with fallback for older browsers

## Deployment

### Option 1: Open Locally
Simply double-click `index.html` to open in your browser.

### Option 2: Host on GitHub Pages (Recommended)

This repository includes a GitHub Actions workflow that automatically deploys your site to GitHub Pages.

#### Setup Steps:

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click **Settings** (top navigation)
   - Click **Pages** (left sidebar)
   - Under "Build and deployment":
     - **Source**: Select "GitHub Actions"
   - Save the settings

3. **Automatic Deployment:**
   - The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically run
   - Every push to `main` or `master` branch will trigger a new deployment
   - You can also manually trigger deployment from the "Actions" tab

4. **Access Your Site:**
   - After deployment completes (usually 1-2 minutes)
   - Your site will be available at: `https://yourusername.github.io/repository-name`
   - Example: `https://szrick.github.io/easy-copy-and-paste-for-mass-messenger`

#### Manual Deployment (Alternative):

If you prefer not to use GitHub Actions:

1. Go to Settings > Pages
2. Under "Source", select "Deploy from a branch"
3. Select your branch (main/master) and folder (root)
4. Click Save
5. Access via: `https://yourusername.github.io/repository-name`

#### Benefits of GitHub Actions Deployment:

- ✅ Automatic deployment on every push
- ✅ Consistent build process
- ✅ Can be triggered manually when needed
- ✅ View deployment history in Actions tab
- ✅ No additional configuration needed

### Option 3: Host Anywhere
Upload the files (`index.html`, `styles.css`, `script.js`) to any web hosting service like:
- Netlify (drag and drop)
- Vercel (automatic from GitHub)
- Firebase Hosting
- Any static hosting provider

## License

This project is free to use for personal and congregational purposes.

## Credits

Created for Jehovah's Witnesses congregations to simplify the process of notifying brothers and sisters about their meeting assignments via Zangi messenger.

## Support

If you encounter any issues or have suggestions for improvements, please create an issue in the repository.

---

**Note:** This is an unofficial tool created to help with organizational tasks. It is not affiliated with or endorsed by Jehovah's Witnesses.
