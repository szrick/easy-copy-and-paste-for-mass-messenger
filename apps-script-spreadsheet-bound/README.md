# JW Assignment Message Generator - Spreadsheet Add-on

This is a **container-bound** Google Apps Script that adds message generation functionality directly into your Google Spreadsheet. Works on **both desktop and mobile**!

## ✨ Features

- 📊 Works with **any worksheet** in your spreadsheet
- 📱 **Mobile-friendly** - works in Google Sheets mobile app
- 🎯 **No external tools** needed - everything in Google Sheets
- ⚡ **One-click copy** - tap message to copy
- 🇨🇳 **Chinese templates** for brothers and sisters
- 🔄 **Auto-detects** brother vs sister assignments

## 📱 Installation (5 minutes)

### Step 1: Open Apps Script

1. Open your Google Spreadsheet
2. Click **Extensions** → **Apps Script**
3. You'll see a blank code editor

### Step 2: Add the Code Files

1. Click the **+** button next to "Files"
2. Choose **"Script"**
3. Name it: **masscode** (it will become `masscode.gs`)
4. Click the **+** button again
5. Choose **"HTML"**
6. Name it: **Dialog**
7. Now you should have:
   - `masscode.gs` (new file for JW messages)
   - `Dialog.html` (new file for UI)
   - Your existing `Code.gs` (unchanged)

### Step 3: Paste the Code

**In `masscode.gs`:**
- Copy all content from `masscode.gs` in this folder
- Paste into the Apps Script editor

**In `Dialog.html`:**
- Copy all content from `Dialog.html` in this folder
- Paste into the Apps Script editor

### Step 4: Save and Authorize

1. Click **💾 Save** (or Ctrl+S / Cmd+S)
2. **Close** the Apps Script tab
3. **Refresh** your spreadsheet
4. You'll see a new menu: **📋 JW Messages**
5. Click it → Choose **"Generate Messages"**
6. Google will ask for permissions → Click **"Continue"**
7. Choose your account → Click **"Advanced"** → **"Go to... (unsafe)"** → **"Allow"**

✅ **Done!** The menu is now ready to use!

## 📱 How to Use

### On Desktop:

1. Click **📋 JW Messages** menu (top menu bar)
2. Click **📨 Generate Messages**
3. Select a worksheet from dropdown
4. Click **"Generate Messages"**
5. Click any message card to copy
6. Paste in Zangi messenger!

### On Mobile (Google Sheets App):

1. Tap **⋮** (three dots, top right)
2. Scroll down and tap **📋 JW Messages**
3. Tap **📨 Generate Messages**
4. Select a worksheet from dropdown
5. Tap **"Generate Messages"**
6. Tap any message card to copy
7. Switch to Zangi app → Paste → Send!

## 📊 Worksheet Format

Your worksheet should have this structure:

**First Row:** Dates (e.g., "MARCH 2-8", "MARCH 9-15")

**Each Column:** One week's assignments

**Assignment Format:**
- Brothers: `3 HXQ`, `6 LX` (number + name)
- Sisters: `4 Hexiaofan / Lingke` (number + student / assistant)

Example:
```
| MARCH 2-8    | MARCH 9-15   | MARCH 16-22  |
|--------------|--------------|--------------|
| 3 HXQ        | 3 WM         | 3 FYH        |
| 4 Zhizhi/... | 4 Xinyu/...  | 4 Xiaowen/...|
| 5 Yating/... | 5 Naishen/...| 5 Zhenhua/...|
| 6 Zhizhi/... | 6 Xinyu/...  | 6 Xiaowen/...|
```

## 🎯 Generated Message Templates

### Brother Message:
```
你好👋 HXQ🧔‍♂️
你有一个新🆕练习🎉🎉

📅：3月2-8日
#️⃣：3

请尽快准备，期待🙏
RH
```

### Sister Message:
```
你好👋 Hexiaofan🧔‍♀️
你有一个新🆕练习🎉🎉

📅：3月2-8日
#️⃣：4
助：Lingke

请尽快准备，期待🙏
RH
```

## 🔧 Troubleshooting

### Menu not appearing?
- Refresh the spreadsheet
- Close and reopen the spreadsheet
- Check if you saved the script

### Permission error?
- You need to authorize the script first
- Click through the security warnings (it's your own script)

### No messages generated?
- Check your worksheet format
- Make sure first row has dates
- Make sure cells have assignment format (e.g., "3 Name")

### Copy not working?
- The script uses clipboard API
- Make sure you're clicking on the message card
- Try tapping firmly on mobile

## 💡 Tips

1. **Multiple worksheets?** No problem! Select different worksheets from the dropdown
2. **Works offline?** No - needs internet to run (Google Apps Script requirement)
3. **Share with others?** They need to install it in their own spreadsheet
4. **Update the code?** Just edit the Apps Script and save - changes apply immediately

## 🆘 Support

If you encounter issues:
1. Check that your worksheet format matches the example
2. Make sure dates are in the first row
3. Verify assignment entries follow the format: "Number Name" or "Number Name / Assistant"

## 📄 License

Free to use for JW congregation purposes.

---

**Created with ❤️ for JW congregations to simplify assignment messaging**
