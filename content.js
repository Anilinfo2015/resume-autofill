// Content script for intelligent form filling
// This script analyzes form fields and matches them with resume data

(function() {
  'use strict';

  // Field mapping patterns - maps common field patterns to resume data
  const FIELD_PATTERNS = {
    // Personal Information
    firstName: ['first', 'fname', 'firstname', 'given', 'forename'],
    lastName: ['last', 'lname', 'lastname', 'surname', 'family'],
    fullName: ['name', 'fullname', 'full_name', 'your name', 'applicant'],
    email: ['email', 'e-mail', 'mail', 'emailaddress'],
    phone: ['phone', 'mobile', 'telephone', 'tel', 'contact', 'cell'],
    address: ['address', 'street', 'address1', 'addr'],
    city: ['city', 'town'],
    state: ['state', 'province', 'region'],
    zipCode: ['zip', 'postal', 'postcode', 'zipcode', 'postalcode'],
    country: ['country', 'nation'],
    linkedin: ['linkedin', 'linked-in'],
    website: ['website', 'site', 'webpage', 'url', 'homepage'],
    portfolio: ['portfolio', 'work samples'],
    github: ['github', 'git'],
    
    // Work Experience
    company: ['company', 'employer', 'organization', 'firm', 'workplace'],
    position: ['position', 'title', 'job title', 'jobtitle', 'role', 'designation'],
    startDate: ['start', 'from', 'begin', 'commenced'],
    endDate: ['end', 'to', 'until', 'finished'],
    current: ['current', 'present', 'ongoing'],
    
    // Education
    school: ['school', 'university', 'college', 'institution', 'alma'],
    degree: ['degree', 'qualification', 'diploma'],
    major: ['major', 'field', 'study', 'specialization', 'concentration'],
    gpa: ['gpa', 'grade', 'grades'],
    graduationDate: ['graduation', 'graduated', 'completion'],
    
    // Other
    summary: ['summary', 'objective', 'about', 'bio', 'description', 'profile'],
    skills: ['skill', 'expertise', 'competenc', 'proficienc'],
    references: ['reference', 'referees'],
    coverLetter: ['cover', 'letter', 'motivation']
  };

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'fillForm') {
      try {
        const fieldsFound = fillFormWithData(request.data);
        sendResponse({
          success: true,
          message: `Successfully filled ${fieldsFound} field(s)`
        });
      } catch (error) {
        sendResponse({
          success: false,
          message: 'Error: ' + error.message
        });
      }
    }
    return true; // Keep message channel open for async response
  });

  function fillFormWithData(resumeData) {
    let fieldsFound = 0;
    
    // Find all input, textarea, and select elements
    const formElements = document.querySelectorAll('input, textarea, select');
    
    formElements.forEach(element => {
      // Skip hidden, submit, button, and already filled fields (unless empty)
      const type = element.type ? element.type.toLowerCase() : '';
      if (type === 'hidden' || type === 'submit' || type === 'button' || type === 'image') {
        return;
      }

      // Get field identifiers
      const fieldInfo = getFieldIdentifiers(element);
      const matchedData = matchFieldToData(fieldInfo, resumeData);
      
      if (matchedData !== null && matchedData !== undefined) {
        fillField(element, matchedData);
        fieldsFound++;
      }
    });

    return fieldsFound;
  }

  function getFieldIdentifiers(element) {
    // Collect all possible identifiers for the field
    const identifiers = [];
    
    // Get from element attributes
    if (element.name) identifiers.push(element.name.toLowerCase());
    if (element.id) identifiers.push(element.id.toLowerCase());
    if (element.placeholder) identifiers.push(element.placeholder.toLowerCase());
    if (element.getAttribute('aria-label')) {
      identifiers.push(element.getAttribute('aria-label').toLowerCase());
    }
    if (element.title) identifiers.push(element.title.toLowerCase());
    
    // Get from associated label
    const label = findLabelForElement(element);
    if (label) {
      identifiers.push(label.toLowerCase());
    }
    
    // Get from autocomplete attribute
    if (element.autocomplete) {
      identifiers.push(element.autocomplete.toLowerCase());
    }
    
    return identifiers;
  }

  function findLabelForElement(element) {
    // Try to find label by 'for' attribute
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent.trim();
    }
    
    // Try to find parent label
    const parentLabel = element.closest('label');
    if (parentLabel) {
      return parentLabel.textContent.trim();
    }
    
    // Try to find previous sibling label
    let sibling = element.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === 'LABEL') {
        return sibling.textContent.trim();
      }
      sibling = sibling.previousElementSibling;
    }
    
    // Try to find nearby text
    const parent = element.parentElement;
    if (parent) {
      const textContent = parent.textContent.trim();
      // Get text before the input element
      const elemIndex = Array.from(parent.children).indexOf(element);
      if (elemIndex > 0) {
        const prevText = Array.from(parent.childNodes)
          .slice(0, elemIndex)
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent.trim())
          .join(' ');
        if (prevText) return prevText;
      }
    }
    
    return null;
  }

  function matchFieldToData(identifiers, resumeData) {
    // Try to match field identifiers with resume data patterns
    for (const [dataKey, patterns] of Object.entries(FIELD_PATTERNS)) {
      for (const identifier of identifiers) {
        for (const pattern of patterns) {
          if (identifier.includes(pattern) || pattern.includes(identifier)) {
            // Found a match, now get the actual data
            const value = getResumeValue(dataKey, resumeData);
            if (value !== null && value !== undefined) {
              return value;
            }
          }
        }
      }
    }
    
    return null;
  }

  function getResumeValue(key, resumeData) {
    // Map data keys to actual resume data structure
    const personal = resumeData.personal || {};
    
    switch(key) {
      // Personal info
      case 'firstName': return personal.firstName;
      case 'lastName': return personal.lastName;
      case 'fullName': return personal.fullName || `${personal.firstName || ''} ${personal.lastName || ''}`.trim();
      case 'email': return personal.email;
      case 'phone': return personal.phone || personal.mobile;
      case 'address': return personal.address;
      case 'city': return personal.city;
      case 'state': return personal.state;
      case 'zipCode': return personal.zipCode || personal.zip || personal.postalCode;
      case 'country': return personal.country;
      case 'linkedin': return personal.linkedin;
      case 'website': return personal.website;
      case 'portfolio': return personal.portfolio;
      case 'github': return personal.github;
      
      // Work experience (use most recent)
      case 'company': 
        return resumeData.workExperience?.[0]?.company;
      case 'position': 
        return resumeData.workExperience?.[0]?.position || resumeData.workExperience?.[0]?.title;
      case 'startDate':
        return resumeData.workExperience?.[0]?.startDate;
      case 'endDate':
        return resumeData.workExperience?.[0]?.endDate;
      case 'current':
        return resumeData.workExperience?.[0]?.current;
      
      // Education (use most recent)
      case 'school':
        return resumeData.education?.[0]?.school || resumeData.education?.[0]?.university;
      case 'degree':
        return resumeData.education?.[0]?.degree;
      case 'major':
        return resumeData.education?.[0]?.major || resumeData.education?.[0]?.field || resumeData.education?.[0]?.fieldOfStudy;
      case 'gpa':
        return resumeData.education?.[0]?.gpa;
      case 'graduationDate':
        return resumeData.education?.[0]?.graduationDate || resumeData.education?.[0]?.endDate;
      
      // Other
      case 'summary':
        return resumeData.summary;
      case 'skills':
        return Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') : resumeData.skills;
      case 'references':
        return resumeData.references;
      
      default:
        return null;
    }
  }

  function fillField(element, value) {
    const tagName = element.tagName.toLowerCase();
    const type = element.type ? element.type.toLowerCase() : '';
    
    if (tagName === 'select') {
      // For select elements, try to find matching option
      fillSelect(element, value);
    } else if (type === 'checkbox') {
      // For checkboxes
      element.checked = !!value;
    } else if (type === 'radio') {
      // For radio buttons
      if (value && element.value.toLowerCase() === value.toString().toLowerCase()) {
        element.checked = true;
      }
    } else {
      // For text inputs and textareas
      element.value = value;
      
      // Trigger events to ensure the form recognizes the change
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true }));
    }
    
    // Visual feedback
    element.style.backgroundColor = '#e8f5e9';
    setTimeout(() => {
      element.style.backgroundColor = '';
    }, 2000);
  }

  function fillSelect(selectElement, value) {
    // Try exact match first
    for (let option of selectElement.options) {
      if (option.value === value || option.text === value) {
        selectElement.value = option.value;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
    }
    
    // Try case-insensitive partial match
    const valueLower = value.toString().toLowerCase();
    for (let option of selectElement.options) {
      const optionTextLower = option.text.toLowerCase();
      const optionValueLower = option.value.toLowerCase();
      
      if (optionTextLower.includes(valueLower) || valueLower.includes(optionTextLower) ||
          optionValueLower.includes(valueLower) || valueLower.includes(optionValueLower)) {
        selectElement.value = option.value;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
    }
  }

  // Console log to confirm script is loaded
  console.log('Resume AutoFill content script loaded');
})();
