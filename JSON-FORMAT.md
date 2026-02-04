# JSON Format Quick Reference

This document provides a quick reference for creating your resume JSON file.

## Minimal Example

The absolute minimum needed:

```json
{
  "personal": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-123-4567"
  }
}
```

## Complete Template

Copy and fill in this template:

```json
{
  "personal": {
    "title": "",
    "firstName": "",
    "lastName": "",
    "fullName": "",
    "email": "",
    "phone": "",
    "address": "",
    "addressLine2": "",
    "city": "",
    "state": "",
    "zipCode": "",
    "country": "",
    "linkedin": "",
    "website": "",
    "portfolio": "",
    "github": "",
    "dateOfBirth": ""
  },
  "summary": "",
  "workExperience": [
    {
      "company": "",
      "position": "",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "current": false,
      "location": "",
      "description": ""
    }
  ],
  "education": [
    {
      "school": "",
      "degree": "",
      "major": "",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "graduationDate": "YYYY-MM",
      "gpa": "",
      "location": ""
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": "YYYY-MM"
    }
  ],
  "languages": [
    {
      "language": "",
      "proficiency": ""
    }
  ],
  "references": [
    {
      "name": "",
      "title": "",
      "relationship": "",
      "company": "",
      "phone": "",
      "email": ""
    }
  ],
  "eligibility": {
    "workAuthorization": "Yes/No",
    "requiresSponsorship": "Yes/No",
    "citizenship": "",
    "driversLicense": "Yes/No"
  },
  "preferences": {
    "salaryExpectation": "",
    "currentSalary": "",
    "availableStartDate": "",
    "noticePeriod": "",
    "willingToRelocate": "Yes/No",
    "willingToTravel": "",
    "yearsOfExperience": ""
  },
  "emergencyContact": {
    "name": "",
    "phone": "",
    "relationship": ""
  },
  "diversity": {
    "gender": "",
    "ethnicity": "",
    "veteranStatus": "",
    "disabilityStatus": ""
  },
  "coverLetter": "",
  "hobbiesInterests": ""
}
```

## Field Types

### Personal Information

| Field | Type | Example | Required |
|-------|------|---------|----------|
| title | string | "Mr", "Miss", "Ms" | Optional |
| firstName | string | "John" | ⭐ Recommended |
| lastName | string | "Doe" | ⭐ Recommended |
| fullName | string | "John Doe" | Optional |
| email | string | "john@example.com" | ⭐ Recommended |
| phone | string | "+1-555-123-4567" | ⭐ Recommended |
| address | string | "123 Main St" | Optional |
| addressLine2 | string | "Apt 4B" | Optional |
| city | string | "San Francisco" | Optional |
| state | string | "CA" | Optional |
| zipCode | string | "94102" | Optional |
| country | string | "United States" | Optional |
| linkedin | string (URL) | "https://linkedin.com/in/..." | Optional |
| website | string (URL) | "https://example.com" | Optional |
| portfolio | string (URL) | "https://portfolio.com" | Optional |
| github | string (URL) | "https://github.com/..." | Optional |
| dateOfBirth | string | "1990-05-15" | Optional |

### Work Experience (Array)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| company | string | "Tech Corp" | Most recent first |
| position | string | "Software Engineer" | |
| startDate | string | "2020-01" | Format: YYYY-MM |
| endDate | string | "Present" or "2023-12" | |
| current | boolean | true | Currently working |
| location | string | "San Francisco, CA" | |
| description | string | "Led development..." | |

### Education (Array)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| school | string | "Stanford University" | Highest first |
| degree | string | "Master of Science" | |
| major | string | "Computer Science" | |
| startDate | string | "2014-09" | Format: YYYY-MM |
| endDate | string | "2016-05" | Format: YYYY-MM |
| graduationDate | string | "2016-05" | Format: YYYY-MM |
| gpa | string | "3.8" | |
| location | string | "Stanford, CA" | |

### Skills (Array)

```json
"skills": [
  "JavaScript",
  "Python",
  "React",
  "Node.js"
]
```

Or as a string:
```json
"skills": "JavaScript, Python, React, Node.js"
```

### References (Array) - NEW!

```json
"references": [
  {
    "name": "Jane Smith",
    "title": "Engineering Manager",
    "relationship": "Former Manager",
    "company": "Tech Corp",
    "phone": "+1-555-987-6543",
    "email": "jane.smith@techcorp.com"
  }
]
```

### Eligibility (Object) - NEW!

These fields address common work authorization questions on job applications:

```json
"eligibility": {
  "workAuthorization": "Yes",
  "requiresSponsorship": "No",
  "citizenship": "US Citizen",
  "driversLicense": "Yes"
}
```

### Preferences (Object) - NEW!

These fields address salary expectations, availability, and other preferences:

```json
"preferences": {
  "salaryExpectation": "$150,000 - $180,000",
  "currentSalary": "$140,000",
  "availableStartDate": "2 weeks notice",
  "noticePeriod": "2 weeks",
  "willingToRelocate": "Yes",
  "willingToTravel": "Up to 25%",
  "yearsOfExperience": "8+ years"
}
```

### Emergency Contact (Object) - NEW!

```json
"emergencyContact": {
  "name": "Mary Doe",
  "phone": "+1-555-111-2222",
  "relationship": "Spouse"
}
```

### Diversity (Object) - NEW!

Optional self-identification information (commonly asked in US applications):

```json
"diversity": {
  "gender": "Prefer not to say",
  "ethnicity": "Prefer not to say",
  "veteranStatus": "I am not a veteran",
  "disabilityStatus": "I do not have a disability"
}
```

### Cover Letter (String) - NEW!

```json
"coverLetter": "Dear Hiring Manager,\n\nI am excited to apply..."
```

### Hobbies & Interests (String) - NEW!

For fields asking "Tell us a bit about yourself" or questions about hobbies, interests, or achievements outside of work/education:

```json
"hobbiesInterests": "In my free time, I enjoy hiking, contributing to open-source projects, and volunteering at local coding bootcamps."
```

### Summary (String)

```json
"summary": "Experienced software engineer with 8+ years..."
```

## Tips

1. **Use Standard Date Format**: YYYY-MM (e.g., "2020-01")
2. **Order Matters**: List most recent work/education first
3. **Be Consistent**: Use the same format throughout
4. **Validate JSON**: Use jsonlint.com to check for errors
5. **Keep Updated**: Update your file regularly
6. **Optional Sections**: Only include sections you need - all fields are optional except basic personal info

## Common Mistakes

❌ **Wrong:**
```json
{
  "firstName" "John"  // Missing colon
}
```

✅ **Right:**
```json
{
  "firstName": "John"
}
```

---

❌ **Wrong:**
```json
{
  "skills": [
    "JavaScript"
    "Python"  // Missing comma
  ]
}
```

✅ **Right:**
```json
{
  "skills": [
    "JavaScript",
    "Python"
  ]
}
```

---

❌ **Wrong:**
```json
{
  "current": "true"  // String instead of boolean
}
```

✅ **Right:**
```json
{
  "current": true
}
```

## Validation

Before using your JSON file:

1. Save as `.json` file (e.g., `my-resume.json`)
2. Validate at https://jsonlint.com
3. Fix any errors shown
4. Load into the extension

## Alternative Field Names

The extension recognizes multiple field name variations:

- `firstName` or `fname` → First Name
- `lastName` or `lname` → Last Name
- `zipCode`, `zip`, or `postalCode` → Zip Code
- `school` or `university` → School Name
- `major`, `field`, or `fieldOfStudy` → Field of Study
- `position`, `title`, or `jobTitle` → Job Title
- `workAuthorization` or `authorizedToWork` → Work Authorization
- `salaryExpectation`, `expectedSalary`, or `desiredSalary` → Salary Expectations
- `availableStartDate` or `availability` → Available Start Date

Use whichever names you prefer!

## Character Encoding

Save your JSON file as UTF-8 encoding to support special characters:
- Accented characters (é, ñ, ü)
- Unicode symbols
- International characters

---

**Need help?** Check `USAGE.md` for detailed documentation or `sample-resume.json` for a complete example.
