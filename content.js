// Content script for intelligent form filling
// This script analyzes form fields and matches them with resume data
// Supports Shadow DOM traversal for modern job application platforms (e.g., SmartRecruiters)

(function() {
  'use strict';

  // Cache native value setters for React compatibility (these don't change at runtime)
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  )?.set;
  const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype, 'value'
  )?.set;

  // Keyboard event trigger values (arbitrary printable character to trigger framework event handlers)
  const TRIGGER_KEY = 'a';
  const TRIGGER_KEY_CODE = 'KeyA';

  /**
   * Recursively finds all form elements including those inside Shadow DOM
   * This is essential for modern job application platforms like SmartRecruiters
   * that use Shadow DOM encapsulation
   * @param {Node} root - The root node to start searching from
   * @returns {Element[]} - Array of form elements found
   */
  function getAllFormElements(root = document) {
    const elements = [];
    const selector = 'input, textarea, select';
    
    // Get elements from the current root
    const rootElements = root.querySelectorAll(selector);
    elements.push(...rootElements);
    
    // Recursively search through Shadow DOMs
    const allElements = root.querySelectorAll('*');
    for (const element of allElements) {
      if (element.shadowRoot) {
        const shadowElements = getAllFormElements(element.shadowRoot);
        elements.push(...shadowElements);
      }
    }
    
    // Also search through iframes (same-origin only)
    try {
      const iframes = root.querySelectorAll('iframe');
      for (const iframe of iframes) {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const iframeElements = getAllFormElements(iframeDoc);
            elements.push(...iframeElements);
          }
        } catch (e) {
          // Cross-origin iframe, skip silently
        }
      }
    } catch (e) {
      // Unable to access iframes, skip silently
    }
    
    return elements;
  }

  // Field mapping patterns - maps common field patterns to resume data
  const FIELD_PATTERNS = {
    // Personal Information
    firstName: ['first', 'fname', 'firstname', 'given', 'forename'],
    lastName: ['last', 'lname', 'lastname', 'surname', 'family'],
    fullName: ['name', 'fullname', 'full_name', 'your name', 'applicant'],
    email: ['email', 'e-mail', 'mail', 'emailaddress'],
    phone: ['phone', 'mobile', 'telephone', 'tel', 'contact', 'cell', 'phonenumber'],
    address: ['address', 'street', 'address1', 'addr', 'streetaddress'],
    addressLine2: ['address2', 'apt', 'suite', 'unit', 'apartment'],
    city: ['city', 'town', 'municipality'],
    state: ['state', 'province', 'region'],
    zipCode: ['zip', 'postal', 'postcode', 'zipcode', 'postalcode'],
    country: ['country', 'nation', 'countryofresidence'],
    linkedin: ['linkedin', 'linked-in', 'linkedinprofile', 'linkedinurl'],
    website: ['website', 'site', 'webpage', 'url', 'homepage', 'personalsite'],
    portfolio: ['portfolio', 'work samples', 'worksamples', 'portfoliourl'],
    github: ['github', 'git', 'githubprofile', 'githuburl'],
    dateOfBirth: ['dob', 'dateofbirth', 'birth', 'birthday', 'birthdate'],
    
    // Work Experience
    company: ['company', 'employer', 'organization', 'firm', 'workplace', 'companyname', 'employername'],
    position: ['position', 'title', 'job title', 'jobtitle', 'role', 'designation', 'jobposition', 'currenttitle'],
    startDate: ['start', 'from', 'begin', 'commenced', 'startdate', 'datefrom'],
    endDate: ['end', 'to', 'until', 'finished', 'enddate', 'dateto'],
    current: ['current', 'present', 'ongoing', 'currentlyworking', 'currentjob'],
    workDescription: ['jobdescription', 'responsibilities', 'duties', 'workdescription', 'jobduties'],
    
    // Secondary work experience (previous job)
    company2: ['previous company', 'previouscompany', 'company2', 'employer2', 'prioremployer'],
    position2: ['previous position', 'previousposition', 'position2', 'title2', 'priortitle', 'previousrole'],
    
    // Education
    school: ['school', 'university', 'college', 'institution', 'alma', 'schoolname', 'universityname'],
    degree: ['degree', 'qualification', 'diploma', 'degreetype', 'educationlevel'],
    major: ['major', 'field', 'study', 'specialization', 'concentration', 'fieldofstudy', 'areaof'],
    gpa: ['gpa', 'grade', 'grades', 'gradepoint', 'cgpa'],
    graduationDate: ['graduation', 'graduated', 'completion', 'graduationdate', 'graduationyear'],
    
    // Secondary education
    school2: ['highschool', 'high school', 'secondaryschool', 'school2'],
    degree2: ['degree2', 'previousdegree'],
    
    // Work Authorization & Eligibility (Common pain point in job applications)
    workAuthorization: ['authorized', 'authorization', 'eligible', 'eligibility', 'legallyauthorized', 'righttowork', 'workpermit', 'legally eligible', 'legaltowork'],
    visaSponsorship: ['sponsorship', 'sponsor', 'visa', 'visastatus', 'requiresponsorship', 'needsponsorship', 'visarequired', 'immigrationstatus'],
    citizenshipStatus: ['citizenship', 'citizen', 'nationalstatus', 'nationality'],
    
    // Salary & Compensation (Common pain point)
    salaryExpectation: ['salary', 'compensation', 'pay', 'expectedsalary', 'desiredsalary', 'salaryexpectation', 'salaryrange', 'payexpectation', 'expectedcompensation', 'wage'],
    currentSalary: ['currentsalary', 'currentpay', 'currentcompensation', 'presentsalary'],
    
    // Availability (Common pain point)
    availableStartDate: ['available', 'availabledate', 'startdate', 'canstart', 'whenstart', 'earlieststart', 'availabilitydate', 'joiningdate'],
    noticePeriod: ['notice', 'noticeperiod', 'noticerequired', 'currentnotice', 'noticedays'],
    
    // References (Common pain point)
    referenceName: ['referencename', 'refname', 'reference1name', 'professionalreference'],
    referencePhone: ['referencephone', 'refphone', 'reference1phone'],
    referenceEmail: ['referenceemail', 'refemail', 'reference1email'],
    referenceRelationship: ['referencerelationship', 'refrelation', 'relationship', 'reference1relationship'],
    references: ['reference', 'referees', 'professionalreferences'],
    
    // Emergency Contact (Common in applications)
    emergencyContactName: ['emergencycontact', 'emergencyname', 'emergency contact name', 'icename'],
    emergencyContactPhone: ['emergencyphone', 'emergency contact phone', 'icephone', 'emergencycontactphone'],
    emergencyContactRelationship: ['emergencyrelationship', 'emergencycontactrelation', 'icerelation'],
    
    // EEO/Diversity (Optional fields - common in US applications)
    gender: ['gender', 'sex'],
    ethnicity: ['ethnicity', 'race', 'ethnic'],
    veteranStatus: ['veteran', 'veteranstatus', 'militarystatus', 'militaryservice'],
    disabilityStatus: ['disability', 'disabilitystatus', 'disabled'],
    
    // Additional common fields
    yearsOfExperience: ['yearsofexperience', 'experience', 'totalexperience', 'yearsexperience', 'experienceyears'],
    highestEducation: ['highesteducation', 'educationlevel', 'highestdegree', 'highestqualification'],
    driversLicense: ['driverslicense', 'license', 'drivinglicense', 'haslicense'],
    willingToRelocate: ['relocate', 'relocation', 'willingtorelocate', 'opentorelocation', 'relocationwilling'],
    willingToTravel: ['travel', 'travelrequired', 'willingtotravel', 'businesstravel', 'travelpercentage'],
    
    // Certifications
    certification: ['certification', 'certificate', 'certifications', 'certname', 'professionalcert'],
    certificationIssuer: ['certissuer', 'issuedby', 'certifyingbody', 'certificationissuer'],
    
    // Languages
    language: ['language', 'languages', 'spokenlanguage', 'languageskill'],
    languageProficiency: ['proficiency', 'fluency', 'languagelevel', 'languageproficiency'],
    
    // Other
    summary: ['summary', 'objective', 'about', 'bio', 'description', 'profile', 'professionalsummary', 'careerobjective'],
    skills: ['skill', 'expertise', 'competenc', 'proficienc', 'technicalskills', 'keyskills'],
    coverLetter: ['cover', 'letter', 'motivation', 'coverletter', 'motivationletter'],
    
    // Social Security / ID (handled carefully)
    ssn: ['ssn', 'socialsecurity', 'social security'],
    nationalId: ['nationalid', 'idnumber', 'governmentid']
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
    
    // Find all input, textarea, and select elements including those in Shadow DOM
    const formElements = getAllFormElements(document);
    
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
    
    // Get from data attributes commonly used by modern job application platforms
    // (SmartRecruiters, Workday, Greenhouse, etc.)
    const dataAttributes = [
      'data-testid',
      'data-qa',
      'data-automation-id',
      'data-field',
      'data-field-name',
      'data-name',
      'data-id'
    ];
    for (const attr of dataAttributes) {
      const value = element.getAttribute(attr);
      if (value) {
        identifiers.push(value.toLowerCase());
      }
    }
    
    // Get from associated label
    const label = findLabelForElement(element);
    if (label) {
      identifiers.push(label.toLowerCase());
    }
    
    // Get from autocomplete attribute
    if (element.autocomplete) {
      identifiers.push(element.autocomplete.toLowerCase());
    }

    // Get from aria-describedby (common in accessible forms)
    const describedBy = element.getAttribute('aria-describedby');
    if (describedBy) {
      // Try to find the element that describes this input
      const ownerDoc = element.ownerDocument || document;
      const descElement = ownerDoc.getElementById(describedBy);
      if (descElement) {
        const descText = descElement.textContent.trim();
        if (descText) {
          identifiers.push(descText.toLowerCase());
        }
      }
    }
    
    return identifiers;
  }

  function findLabelForElement(element) {
    // Get the owner document (important for Shadow DOM)
    const ownerDoc = element.ownerDocument || document;
    const rootNode = element.getRootNode();
    
    // Try to find label by 'for' attribute within the same root (handles Shadow DOM)
    if (element.id) {
      // Check in the same root first (for Shadow DOM support)
      if (rootNode && rootNode !== document && rootNode.querySelector) {
        const label = rootNode.querySelector(`label[for="${element.id}"]`);
        if (label) return label.textContent.trim();
      }
      // Fallback to document-level search
      const label = ownerDoc.querySelector(`label[for="${element.id}"]`);
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
      // Also check for slots (common in Shadow DOM) that may contain labels
      if (sibling.tagName === 'SLOT') {
        const assignedNodes = sibling.assignedNodes({ flatten: true });
        for (const node of assignedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'LABEL') {
            return node.textContent.trim();
          }
        }
      }
      sibling = sibling.previousElementSibling;
    }
    
    // Try to find nearby text
    const parent = element.parentElement;
    if (parent) {
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

    // For Shadow DOM, try to find text in sibling elements (common pattern)
    if (parent) {
      const prevElement = element.previousElementSibling;
      if (prevElement && prevElement.textContent) {
        const text = prevElement.textContent.trim();
        if (text && text.length < 100) { // Reasonable label length
          return text;
        }
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
    const preferences = resumeData.preferences || {};
    const eligibility = resumeData.eligibility || {};
    const emergencyContact = resumeData.emergencyContact || {};
    const reference = resumeData.references?.[0] || {};
    const diversity = resumeData.diversity || {};
    
    switch(key) {
      // Personal info
      case 'firstName': return personal.firstName;
      case 'lastName': return personal.lastName;
      case 'fullName': return personal.fullName || `${personal.firstName || ''} ${personal.lastName || ''}`.trim();
      case 'email': return personal.email;
      case 'phone': return personal.phone || personal.mobile;
      case 'address': return personal.address;
      case 'addressLine2': return personal.addressLine2 || personal.apt || personal.suite;
      case 'city': return personal.city;
      case 'state': return personal.state;
      case 'zipCode': return personal.zipCode || personal.zip || personal.postalCode;
      case 'country': return personal.country;
      case 'linkedin': return personal.linkedin;
      case 'website': return personal.website;
      case 'portfolio': return personal.portfolio;
      case 'github': return personal.github;
      case 'dateOfBirth': return personal.dateOfBirth || personal.dob;
      
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
      case 'workDescription':
        return resumeData.workExperience?.[0]?.description;
      
      // Secondary work experience (previous job)
      case 'company2':
        return resumeData.workExperience?.[1]?.company;
      case 'position2':
        return resumeData.workExperience?.[1]?.position || resumeData.workExperience?.[1]?.title;
      
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
      
      // Secondary education
      case 'school2':
        return resumeData.education?.[1]?.school || resumeData.education?.[1]?.university;
      case 'degree2':
        return resumeData.education?.[1]?.degree;
      
      // Work Authorization & Eligibility
      case 'workAuthorization':
        return eligibility.workAuthorization || eligibility.authorizedToWork;
      case 'visaSponsorship':
        return eligibility.requiresSponsorship || eligibility.visaSponsorship;
      case 'citizenshipStatus':
        return eligibility.citizenship || eligibility.citizenshipStatus;
      
      // Salary & Compensation
      case 'salaryExpectation':
        return preferences.salaryExpectation || preferences.expectedSalary || preferences.desiredSalary;
      case 'currentSalary':
        return preferences.currentSalary || resumeData.workExperience?.[0]?.salary;
      
      // Availability
      case 'availableStartDate':
        return preferences.availableStartDate || preferences.startDate || preferences.availability;
      case 'noticePeriod':
        return preferences.noticePeriod || preferences.notice;
      
      // References (use first reference from array, or legacy format)
      case 'referenceName': {
        // Check array format first, then legacy object format
        if (reference.name) {
          return reference.name;
        }
        // Handle legacy single-object format
        const legacyRef = typeof resumeData.references === 'object' && !Array.isArray(resumeData.references) 
          ? resumeData.references 
          : null;
        return legacyRef?.name || null;
      }
      case 'referencePhone':
        return reference.phone;
      case 'referenceEmail':
        return reference.email;
      case 'referenceRelationship':
        return reference.relationship || reference.title;
      case 'references':
        // For textarea/text fields asking for references
        if (Array.isArray(resumeData.references)) {
          return resumeData.references.map(r => {
            const name = r.name || 'Unknown';
            const relationship = r.relationship || r.title || '';
            const contact = r.phone || r.email || '';
            // Build reference string, filtering out empty parts
            const parts = [name, relationship, contact].filter(p => p);
            return parts.join(' - ');
          }).join('\n');
        }
        return typeof resumeData.references === 'string' ? resumeData.references : null;
      
      // Emergency Contact
      case 'emergencyContactName':
        return emergencyContact.name;
      case 'emergencyContactPhone':
        return emergencyContact.phone;
      case 'emergencyContactRelationship':
        return emergencyContact.relationship;
      
      // EEO/Diversity (Optional)
      case 'gender':
        return diversity.gender;
      case 'ethnicity':
        return diversity.ethnicity || diversity.race;
      case 'veteranStatus':
        return diversity.veteranStatus;
      case 'disabilityStatus':
        return diversity.disabilityStatus;
      
      // Additional common fields
      case 'yearsOfExperience':
        return preferences.yearsOfExperience || resumeData.yearsOfExperience;
      case 'highestEducation':
        return resumeData.education?.[0]?.degree;
      case 'driversLicense':
        return eligibility.driversLicense || eligibility.hasDriversLicense;
      case 'willingToRelocate':
        return preferences.willingToRelocate || preferences.relocate;
      case 'willingToTravel':
        return preferences.willingToTravel || preferences.travel;
      
      // Certifications
      case 'certification':
        return resumeData.certifications?.[0]?.name;
      case 'certificationIssuer':
        return resumeData.certifications?.[0]?.issuer;
      
      // Languages
      case 'language':
        return resumeData.languages?.[0]?.language;
      case 'languageProficiency':
        return resumeData.languages?.[0]?.proficiency;
      
      // Other
      case 'summary':
        return resumeData.summary;
      case 'skills':
        return Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') : resumeData.skills;
      case 'coverLetter':
        return resumeData.coverLetter;
      
      // SSN / National ID (handle carefully - only fill if explicitly provided)
      case 'ssn':
        return personal.ssn;
      case 'nationalId':
        return personal.nationalId;
      
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
      // Trigger events for React/Angular/Vue frameworks
      triggerInputEvents(element);
    } else if (type === 'radio') {
      // For radio buttons
      if (value && element.value.toLowerCase() === value.toString().toLowerCase()) {
        element.checked = true;
        // Trigger events for React/Angular/Vue frameworks
        triggerInputEvents(element);
      }
    } else {
      // For text inputs and textareas
      // Focus the element first (important for some frameworks)
      // Wrapped in try-catch to avoid disrupting accessibility or user interaction
      try {
        if (element.offsetParent !== null) { // Check if element is visible
          element.focus();
        }
      } catch (e) {
        // Ignore focus errors (element may not be focusable)
      }
      
      // Set the value using cached native value setters to bypass React's synthetic events
      if (tagName === 'textarea' && nativeTextareaValueSetter) {
        nativeTextareaValueSetter.call(element, value);
      } else if (nativeInputValueSetter) {
        nativeInputValueSetter.call(element, value);
      } else {
        element.value = value;
      }
      
      // Trigger comprehensive events to ensure the form recognizes the change
      // This is essential for React-controlled forms and modern UI frameworks
      triggerInputEvents(element);
    }
    
    // Visual feedback
    element.style.backgroundColor = '#e8f5e9';
    setTimeout(() => {
      element.style.backgroundColor = '';
    }, 2000);
  }

  /**
   * Triggers comprehensive input events for React/Angular/Vue compatibility
   * @param {Element} element - The element to trigger events on
   */
  function triggerInputEvents(element) {
    // Create and dispatch events that React and other frameworks listen to
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    const blurEvent = new Event('blur', { bubbles: true, cancelable: true });
    
    // React 16+ uses these events
    element.dispatchEvent(inputEvent);
    element.dispatchEvent(changeEvent);
    element.dispatchEvent(blurEvent);
    
    // Also try keyboard events for some edge cases where frameworks listen for keydown
    // to validate input. The TRIGGER_KEY values are arbitrary - any printable character
    // works. Some frameworks use keydown to detect user interaction and trigger
    // validation or state updates that wouldn't occur with just input/change events.
    try {
      const keyboardEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: TRIGGER_KEY,
        code: TRIGGER_KEY_CODE
      });
      element.dispatchEvent(keyboardEvent);
    } catch (e) {
      // Ignore if keyboard events not supported
    }
  }

  function fillSelect(selectElement, value) {
    // Try exact match first
    for (let option of selectElement.options) {
      if (option.value === value || option.text === value) {
        selectElement.value = option.value;
        triggerInputEvents(selectElement);
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
        triggerInputEvents(selectElement);
        return;
      }
    }
  }

  // Console log to confirm script is loaded
  console.log('Resume AutoFill content script loaded (with Shadow DOM support)');
})();
