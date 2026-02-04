# Resume AutoFill Chrome Extension

A smart Chrome extension that automatically fills job application forms with your resume data from a JSON file.

## Features

- 📝 **Intelligent Form Detection**: Automatically detects and matches form fields with your resume data
- 🎯 **Smart Field Mapping**: Uses fuzzy matching to identify fields based on labels, names, placeholders, and aria-labels
- 💼 **Comprehensive Data Support**: Handles personal info, work experience, education, skills, and more
- 🚀 **Easy to Use**: Simple popup interface to load and manage your resume data
- 🎨 **Visual Feedback**: Highlights filled fields temporarily for easy verification
- 📄 **Sample Resume**: Includes a sample JSON format to get started quickly

## Installation

### From Source (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the extension directory containing `manifest.json`

### Files Structure

```
resume-autofill/
├── manifest.json          # Extension configuration
├── popup.html            # Popup UI
├── popup.css             # Popup styles
├── popup.js              # Popup logic
├── content.js            # Form filling logic
├── background.js         # Background service worker
├── sample-resume.json    # Sample resume format
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## Usage

### Step 1: Prepare Your Resume JSON

Create a JSON file with your resume data. See `sample-resume.json` for the complete format. Here's a minimal example:

```json
{
  "personal": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102"
  },
  "workExperience": [
    {
      "company": "Tech Corp",
      "position": "Software Engineer",
      "startDate": "2020-01",
      "endDate": "Present",
      "current": true,
      "description": "Led development of key features..."
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Bachelor of Science",
      "major": "Computer Science",
      "graduationDate": "2019-05",
      "gpa": "3.8"
    }
  ],
  "skills": ["JavaScript", "Python", "React", "Node.js"],
  "summary": "Experienced software engineer..."
}
```

### Step 2: Load Your Resume Data

1. Click the extension icon in Chrome's toolbar
2. Click "Choose File" and select your resume JSON file
3. Or click "Load Sample Resume" to try the demo data
4. Verify your data is loaded (name, email, phone will be shown)

### Step 3: Fill Job Application Forms

1. Navigate to any job application form
2. Click the extension icon
3. Click "Fill Current Page"
4. The extension will automatically fill matching fields
5. Review and adjust any fields as needed before submitting

## JSON Data Format

The extension supports a comprehensive resume format. All fields are optional:

### Personal Information

```json
{
  "personal": {
    "firstName": "string",
    "lastName": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "mobile": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string",
    "linkedin": "string (URL)",
    "website": "string (URL)",
    "portfolio": "string (URL)",
    "github": "string (URL)"
  }
}
```

### Work Experience

```json
{
  "workExperience": [
    {
      "company": "string",
      "position": "string",
      "title": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or 'Present'",
      "current": true/false,
      "location": "string",
      "description": "string",
      "responsibilities": ["string", "string"]
    }
  ]
}
```

### Education

```json
{
  "education": [
    {
      "school": "string",
      "university": "string",
      "degree": "string",
      "field": "string",
      "major": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "graduationDate": "YYYY-MM",
      "gpa": "string",
      "location": "string"
    }
  ]
}
```

### Skills, Summary, and More

```json
{
  "skills": ["skill1", "skill2", "skill3"],
  "summary": "string",
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "YYYY-MM",
      "url": "string"
    }
  ],
  "languages": [
    {
      "language": "string",
      "proficiency": "string"
    }
  ],
  "references": "string"
}
```

## How It Works

### Intelligent Field Detection

The extension uses multiple strategies to identify form fields:

1. **Field Identifiers**: Analyzes field names, IDs, placeholders, aria-labels, and titles
2. **Label Detection**: Finds associated labels using:
   - `<label for="...">` attributes
   - Parent `<label>` elements
   - Adjacent text and labels
3. **Pattern Matching**: Uses fuzzy matching against common field patterns:
   - Example: "fname", "first", "firstname" → firstName
   - Example: "email", "e-mail", "emailaddress" → email
4. **Smart Data Selection**: Automatically selects the most relevant data:
   - Most recent work experience
   - Highest education level
   - Combined skills list

### Field Types Supported

- ✅ Text inputs
- ✅ Textareas
- ✅ Email inputs
- ✅ Phone inputs
- ✅ URL inputs
- ✅ Select dropdowns
- ✅ Checkboxes
- ✅ Radio buttons
- ✅ Date inputs

### Visual Feedback

Fields that are successfully filled will briefly flash with a green background, making it easy to see what was populated.

## Privacy & Security

- **Local Storage Only**: All resume data is stored locally in Chrome's sync storage
- **No External Requests**: The extension doesn't send your data anywhere
- **No Tracking**: No analytics or tracking of any kind
- **Open Source**: All code is visible and auditable

## Tips for Best Results

1. **Use Consistent Format**: Keep your JSON file well-formatted and validated
2. **Multiple Aliases**: The extension recognizes many field name variations
3. **Review Before Submit**: Always review filled forms before submitting
4. **Update Regularly**: Keep your resume JSON up to date
5. **Test First**: Try with the sample resume on a test form first

## Common Field Patterns Recognized

The extension recognizes 100+ field pattern variations including:

- **Names**: first name, fname, firstname, given name, last name, lname, surname, full name
- **Contact**: email, e-mail, phone, mobile, telephone, cell, contact number
- **Location**: address, street, city, town, state, province, zip, postal code, country
- **Work**: company, employer, position, job title, role, start date, end date
- **Education**: school, university, college, degree, major, field of study, GPA
- **Social**: linkedin, github, portfolio, website, homepage
- And many more...

## Troubleshooting

### Fields Not Filling

- Check if the field labels/names match common patterns
- Verify your JSON file is properly formatted
- Try using the browser console (F12) to see any error messages
- Some websites use non-standard form implementations

### Data Not Loading

- Ensure your JSON file is valid (use a JSON validator)
- Check Chrome's storage permissions for the extension
- Try reloading the extension

### Extension Not Working

- Refresh the page after loading resume data
- Check if the extension has permission for the current website
- Try disabling other extensions that might conflict

## Development

### Building from Source

No build process required! This is a pure JavaScript Chrome extension.

### Testing

1. Load the extension in developer mode
2. Open browser console (F12)
3. Navigate to a form page
4. Check console for any errors or logs

### Contributing

Feel free to submit issues or pull requests to improve the extension.

## Version History

- **v1.0.0** (2024): Initial release
  - Intelligent form field detection
  - Comprehensive resume data support
  - Visual feedback for filled fields
  - Sample resume template

## License

MIT License - Feel free to use and modify as needed.

## Credits

Created to help job seekers apply more efficiently by automating the repetitive task of filling out job application forms.

---

**Note**: This extension is designed to assist with form filling. Always review filled information before submitting applications. Different websites may have different form structures, so results may vary.
