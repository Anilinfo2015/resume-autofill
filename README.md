# Resume AutoFill - Chrome Extension

🚀 A smart Chrome extension that automatically fills job application forms with your resume data.

## Overview

Resume AutoFill is an intelligent Chrome browser extension that helps you apply for jobs faster by automatically filling out application forms with your resume information. Simply load your resume data from a JSON file, navigate to any job application form, and let the extension do the work!

## Key Features

- 📝 **Smart Form Detection**: Automatically identifies and fills form fields based on intelligent pattern matching
- 🎯 **Fuzzy Field Matching**: Recognizes 100+ field name variations (firstname, fname, first_name, etc.)
- 💼 **Comprehensive Data**: Supports personal info, work history, education, skills, certifications, and more
- 🔒 **Privacy First**: All data stored locally, no external requests
- 🎨 **Visual Feedback**: Highlights filled fields for easy verification
- 📄 **Easy Setup**: Includes sample JSON format to get started

## Quick Start

### Installation

1. Clone this repository or download as ZIP
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the extension folder

### Usage

1. Click the extension icon in your Chrome toolbar
2. Load your resume JSON file (or try the sample)
3. Navigate to any job application form
4. Click "Fill Current Page" in the popup
5. Review and submit!

## JSON Format

Create a JSON file with your resume data:

```json
{
  "personal": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "city": "San Francisco",
    "state": "CA"
  },
  "workExperience": [
    {
      "company": "Tech Corp",
      "position": "Software Engineer",
      "startDate": "2020-01",
      "endDate": "Present"
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Bachelor of Science",
      "major": "Computer Science"
    }
  ],
  "skills": ["JavaScript", "Python", "React"]
}
```

See `sample-resume.json` for a complete example with all supported fields.

## Documentation

- **[USAGE.md](USAGE.md)** - Complete user guide with all features, JSON format specification, and troubleshooting
- **[sample-resume.json](sample-resume.json)** - Example resume data showing all supported fields

## How It Works

The extension analyzes form fields using:

1. Field attributes (name, id, placeholder, aria-label)
2. Associated labels and nearby text
3. Pattern matching against common field names
4. Smart data selection (e.g., most recent job/education)

It supports all major field types: text, textarea, select, checkbox, radio, date, email, phone, and URL inputs.

## Files

- `manifest.json` - Chrome extension configuration
- `popup.html/css/js` - Extension popup interface
- `content.js` - Smart form filling logic (300+ lines)
- `background.js` - Background service worker
- `sample-resume.json` - Example resume data
- `icons/` - Extension icons

## Privacy & Security

- ✅ All data stored locally in Chrome
- ✅ No external network requests
- ✅ No tracking or analytics
- ✅ Open source and auditable

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium browsers

## Tips

- Keep your JSON file updated with latest info
- Always review filled forms before submitting
- The extension recognizes many field name variations
- Test with the sample resume first

## Troubleshooting

If fields aren't filling:
- Verify your JSON is valid
- Check field names match common patterns
- Some sites use non-standard forms
- Check browser console for errors

## License

MIT License - Free to use and modify

## Contributing

Issues and pull requests welcome!

---

**Made for job seekers to save time and apply more efficiently** 💼✨
