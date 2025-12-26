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

### Step 2: Make Your Sheet Public

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

### Option 2: Host on GitHub Pages
1. Push this repository to GitHub
2. Go to Settings > Pages
3. Select your branch and save
4. Access via: `https://yourusername.github.io/repository-name`

### Option 3: Host Anywhere
Upload the three files (`index.html`, `styles.css`, `script.js`) to any web hosting service.

## License

This project is free to use for personal and congregational purposes.

## Credits

Created for Jehovah's Witnesses congregations to simplify the process of notifying brothers and sisters about their meeting assignments via Zangi messenger.

## Support

If you encounter any issues or have suggestions for improvements, please create an issue in the repository.

---

**Note:** This is an unofficial tool created to help with organizational tasks. It is not affiliated with or endorsed by Jehovah's Witnesses.
