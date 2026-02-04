# Installation Guide

## Step-by-Step Installation

### 1. Get the Extension Files

**Option A: Clone from GitHub**
```bash
git clone https://github.com/Anilinfo2015/resume-autofill.git
cd resume-autofill
```

**Option B: Download ZIP**
1. Go to the GitHub repository
2. Click the green "Code" button
3. Select "Download ZIP"
4. Extract the ZIP file to a folder on your computer

### 2. Install in Chrome

1. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or: Click the three dots menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Find the "Developer mode" toggle in the top right corner
   - Turn it ON (it should turn blue)

3. **Load the Extension**
   - Click the "Load unpacked" button
   - Navigate to the folder containing the extension files
   - Select the folder (it should contain `manifest.json`)
   - Click "Select Folder" or "Open"

4. **Verify Installation**
   - You should see "Resume AutoFill" appear in your extensions list
   - The extension icon should appear in your Chrome toolbar
   - If you don't see the icon, click the puzzle piece icon and pin the Resume AutoFill extension

### 3. Test the Extension

1. **Open the Test Form**
   - Open the `test-form.html` file in Chrome
   - Or navigate to any job application website

2. **Load Sample Data**
   - Click the Resume AutoFill extension icon
   - Click "Load Sample Resume" button
   - You should see a success message

3. **Fill the Form**
   - Click the "Fill Current Page" button
   - Watch as the form fields populate automatically
   - Fields that are filled will briefly highlight in green

### 4. Load Your Own Resume Data

1. **Prepare Your JSON File**
   - Create a JSON file based on `sample-resume.json`
   - Include all your personal information, work history, education, etc.
   - Validate your JSON using a tool like jsonlint.com

2. **Load Your Data**
   - Click the extension icon
   - Click "Choose File"
   - Select your resume JSON file
   - Verify your data appears in the preview

3. **Start Filling Forms**
   - Navigate to any job application form
   - Click the extension icon
   - Click "Fill Current Page"
   - Review and adjust fields as needed

## Troubleshooting Installation

### Extension Not Loading

**Error: "Manifest file is missing or unreadable"**
- Make sure you selected the correct folder
- The folder must contain `manifest.json`
- Check file permissions

**Error: "Invalid manifest"**
- The extension files may be corrupted
- Re-download or re-clone the repository
- Ensure all files are present

### Extension Icon Not Visible

1. Click the puzzle piece icon in Chrome toolbar
2. Find "Resume AutoFill" in the list
3. Click the pin icon next to it

### Extension Not Working

1. **Refresh the extension:**
   - Go to `chrome://extensions/`
   - Find Resume AutoFill
   - Click the refresh icon

2. **Check permissions:**
   - The extension needs permission to access web pages
   - Click "Details" under the extension
   - Verify "Site access" is set appropriately

3. **Reload the web page:**
   - After installing or updating the extension
   - Refresh any open pages for changes to take effect

## Installing in Other Browsers

### Microsoft Edge

1. Open Edge and go to `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the extension folder
5. Follow the same steps as Chrome

### Brave Browser

1. Open Brave and go to `brave://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the extension folder
5. Follow the same steps as Chrome

### Other Chromium Browsers

Most Chromium-based browsers (Opera, Vivaldi, etc.) follow a similar process:
1. Go to the extensions page (usually `chrome://extensions/` or similar)
2. Enable developer mode
3. Load unpacked extension
4. Select the extension folder

## Updating the Extension

### Manual Update

1. Go to `chrome://extensions/`
2. Find Resume AutoFill
3. Click the refresh icon (circular arrow)
4. The extension will reload with any new changes

### After Pulling Updates from Git

```bash
cd resume-autofill
git pull origin main
```

Then refresh the extension in Chrome as described above.

## Uninstalling

1. Go to `chrome://extensions/`
2. Find Resume AutoFill
3. Click "Remove"
4. Confirm removal

Your resume data is stored in Chrome's sync storage and will be cleared when you uninstall the extension.

## Tips

- **Pin the extension icon** for easy access
- **Keep your resume JSON updated** with latest information
- **Test first** with the sample resume on the test form
- **Review filled forms** before submitting applications
- **Back up your JSON file** so you don't lose your data

## Need Help?

If you encounter issues:
1. Check the browser console for errors (F12 → Console)
2. Verify your JSON file is valid
3. Try reloading the extension
4. Open an issue on GitHub with details about your problem

---

**You're all set! Happy job hunting! 🎉**
