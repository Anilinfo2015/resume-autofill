// Content script for intelligent form filling
// This script analyzes form fields and matches them with resume data

(function() {
  'use strict';

  // Field mapping patterns - maps common field patterns to resume data
  // Minimum pattern length for matching to avoid false positives with short patterns
  const MIN_PATTERN_LENGTH = 4;

  const FIELD_PATTERNS = {
    // Personal Information
    firstName: ['firstname', 'first_name', 'fname', 'givenname', 'forename', 'first name'],
    lastName: ['lastname', 'last_name', 'lname', 'surname', 'familyname', 'family name', 'last name'],
    fullName: ['fullname', 'full_name', 'yourname', 'applicantname', 'candidatename', 'your name', 'full name'],
    email: ['email', 'e-mail', 'emailaddress', 'email_address', 'useremail', 'contactemail'],
    phone: ['phone', 'mobile', 'telephone', 'phonenumber', 'phone_number', 'contactphone', 'cellphone', 'mobilenumber'],
    address: ['address', 'street', 'address1', 'streetaddress', 'street_address', 'homeaddress'],
    addressLine2: ['address2', 'addressline2', 'suite', 'apartment', 'aptnum', 'unitnumber'],
    city: ['city', 'town', 'municipality', 'cityname'],
    state: ['state', 'province', 'region', 'stateprovince'],
    zipCode: ['zipcode', 'zip_code', 'postal', 'postcode', 'postalcode', 'postal_code'],
    country: ['country', 'nation', 'countryofresidence', 'countryname'],
    linkedin: ['linkedin', 'linked-in', 'linkedinprofile', 'linkedinurl', 'linkedin_url'],
    website: ['website', 'personalsite', 'homepage', 'personalwebsite', 'weburl'],
    portfolio: ['portfolio', 'portfoliourl', 'worksamples', 'portfolio_url'],
    github: ['github', 'githubprofile', 'githuburl', 'github_url'],
    dateOfBirth: ['dateofbirth', 'date_of_birth', 'birthdate', 'birthday', 'dob'],
    
    // Work Experience
    company: ['company', 'employer', 'organization', 'companyname', 'employername', 'workplace', 'firmname'],
    position: ['position', 'jobtitle', 'job_title', 'role', 'designation', 'jobposition', 'currenttitle', 'positiontitle'],
    startDate: ['startdate', 'start_date', 'datefrom', 'fromdate', 'begindate', 'commenced'],
    endDate: ['enddate', 'end_date', 'dateto', 'todate', 'finishdate', 'finished'],
    current: ['currentjob', 'currentlyworking', 'currentemployer', 'currentlyemployed', 'presentemployer'],
    workDescription: ['jobdescription', 'responsibilities', 'duties', 'workdescription', 'jobduties', 'roleresponsibilities'],
    
    // Secondary work experience (previous job)
    company2: ['previouscompany', 'company2', 'employer2', 'prioremployer', 'formeremployer', 'previous company'],
    position2: ['previousposition', 'position2', 'title2', 'priortitle', 'previousrole', 'formertitle', 'previous position'],
    
    // Education
    school: ['school', 'university', 'college', 'institution', 'schoolname', 'universityname', 'collegename', 'almamater'],
    degree: ['degree', 'qualification', 'diploma', 'degreetype', 'educationlevel', 'degreename'],
    major: ['major', 'fieldofstudy', 'field_of_study', 'specialization', 'concentration', 'studyfield', 'areaof'],
    gpa: ['gpa', 'gradepoint', 'gradepointaverage', 'cgpa', 'grades'],
    graduationDate: ['graduation', 'graduationdate', 'graduation_date', 'graduationyear', 'completiondate'],
    
    // Secondary education
    school2: ['highschool', 'secondaryschool', 'school2', 'previousschool', 'high school'],
    degree2: ['degree2', 'previousdegree', 'seconddegree'],
    
    // Work Authorization & Eligibility (Common pain point in job applications)
    workAuthorization: ['authorized', 'authorization', 'legallyauthorized', 'righttowork', 'workpermit', 'legaltowork', 'workeligibility', 'legally eligible', 'right to work'],
    visaSponsorship: ['sponsorship', 'sponsor', 'visastatus', 'requiresponsorship', 'needsponsorship', 'visarequired', 'immigrationstatus', 'visasponsorship'],
    citizenshipStatus: ['citizenship', 'citizenshipstatus', 'nationalstatus', 'nationality'],
    
    // Salary & Compensation (Common pain point)
    salaryExpectation: ['salary', 'compensation', 'expectedsalary', 'desiredsalary', 'salaryexpectation', 'salaryrange', 'payexpectation', 'expectedcompensation', 'wagerate'],
    currentSalary: ['currentsalary', 'currentpay', 'currentcompensation', 'presentsalary', 'current_salary'],
    
    // Availability (Common pain point)
    availableStartDate: ['availabledate', 'canstart', 'whenstart', 'earlieststart', 'availabilitydate', 'joiningdate', 'available_date', 'startavailability'],
    noticePeriod: ['noticeperiod', 'notice_period', 'noticerequired', 'currentnotice', 'noticedays'],
    
    // References (Common pain point)
    referenceName: ['referencename', 'refname', 'reference1name', 'professionalreference', 'reference_name'],
    referencePhone: ['referencephone', 'refphone', 'reference1phone', 'reference_phone'],
    referenceEmail: ['referenceemail', 'refemail', 'reference1email', 'reference_email'],
    referenceRelationship: ['referencerelationship', 'refrelation', 'reference1relationship', 'reference_relationship'],
    references: ['references', 'referees', 'professionalreferences', 'referencelist'],
    
    // Emergency Contact (Common in applications)
    emergencyContactName: ['emergencycontact', 'emergencyname', 'icename', 'emergencycontactname', 'emergency contact name'],
    emergencyContactPhone: ['emergencyphone', 'icephone', 'emergencycontactphone', 'emergency contact phone'],
    emergencyContactRelationship: ['emergencyrelationship', 'emergencycontactrelation', 'icerelation', 'emergencycontactrelationship'],
    
    // EEO/Diversity (Optional fields - common in US applications)
    gender: ['gender', 'genderidentity', 'gender_identity'],
    ethnicity: ['ethnicity', 'race', 'ethnicbackground', 'ethnic_background', 'ethnicorigin'],
    veteranStatus: ['veteran', 'veteranstatus', 'militarystatus', 'militaryservice', 'veteran_status'],
    disabilityStatus: ['disability', 'disabilitystatus', 'disability_status', 'disabled'],
    
    // Additional common fields
    yearsOfExperience: ['yearsofexperience', 'years_of_experience', 'totalexperience', 'yearsexperience', 'experienceyears', 'workexperience'],
    highestEducation: ['highesteducation', 'educationlevel', 'highestdegree', 'highestqualification', 'highest_education'],
    driversLicense: ['driverslicense', 'drivinglicense', 'haslicense', 'drivers_license', 'drivinglicence'],
    willingToRelocate: ['relocate', 'relocation', 'willingtorelocate', 'opentorelocation', 'relocationwilling', 'canrelocate'],
    willingToTravel: ['travelrequired', 'willingtotravel', 'businesstravel', 'travelpercentage', 'cantravel', 'travelwilling'],
    
    // Certifications
    certification: ['certification', 'certificate', 'certifications', 'certname', 'professionalcert', 'certificationname'],
    certificationIssuer: ['certissuer', 'issuedby', 'certifyingbody', 'certificationissuer', 'issuerorganization'],
    
    // Languages
    language: ['language', 'languages', 'spokenlanguage', 'languageskill', 'languageproficiency'],
    languageProficiency: ['proficiency', 'fluency', 'languagelevel', 'languagefluency', 'proficiencylevel'],
    
    // Other
    summary: ['summary', 'objective', 'about', 'biography', 'professionalsummary', 'careerobjective', 'professionalprofile', 'aboutme'],
    skills: ['skills', 'expertise', 'competencies', 'proficiencies', 'technicalskills', 'keyskills', 'skillset'],
    coverLetter: ['coverletter', 'cover_letter', 'motivationletter', 'motivation_letter', 'coveringletter'],
    
    // Social Security / ID (handled carefully)
    ssn: ['ssn', 'socialsecurity', 'social security', 'socialsecuritynumber'],
    nationalId: ['nationalid', 'idnumber', 'governmentid', 'national_id', 'nationalidnumber']
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
    // Use a scoring system to find the best match, not just the first match
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [dataKey, patterns] of Object.entries(FIELD_PATTERNS)) {
      for (const identifier of identifiers) {
        for (const pattern of patterns) {
          const score = getMatchScore(identifier, pattern);
          if (score > bestScore) {
            const value = getResumeValue(dataKey, resumeData);
            if (value !== null && value !== undefined) {
              bestScore = score;
              bestMatch = value;
            }
          }
        }
      }
    }
    
    return bestMatch;
  }
  
  function getMatchScore(identifier, pattern) {
    // Normalize both strings: remove spaces, underscores, hyphens and convert to lowercase
    const normalizedIdentifier = identifier.replace(/[\s_-]/g, '').toLowerCase();
    const normalizedPattern = pattern.replace(/[\s_-]/g, '').toLowerCase();
    
    // Exact match gets highest score
    if (normalizedIdentifier === normalizedPattern) {
      return 100;
    }
    
    // Special handling for known short patterns that are unambiguous (like 'gpa', 'dob', 'ssn', 'ice')
    // These are specific enough to be matched even though they're short
    const unambiguousShortPatterns = ['gpa', 'dob', 'ssn', 'ice'];
    const isUnambiguousShort = unambiguousShortPatterns.includes(normalizedPattern);
    
    // Check if identifier contains the pattern
    if (normalizedIdentifier.includes(normalizedPattern)) {
      // Only match if pattern is significant (at least MIN_PATTERN_LENGTH characters)
      // OR if it's an unambiguous short pattern
      // This prevents short patterns like "to", "from", "name" from matching incorrectly
      if (normalizedPattern.length >= MIN_PATTERN_LENGTH || isUnambiguousShort) {
        // Score based on how much of the identifier is covered by the pattern
        // Longer patterns relative to identifier length get higher scores
        // Cap coverage at 1.0 to keep score in documented range
        const coverage = Math.min(1, normalizedPattern.length / normalizedIdentifier.length);
        return 50 + (coverage * 40); // Score range: 50-90
      }
    }
    
    // Reverse match (pattern contains identifier) - only for substantial identifiers
    // This helps when a field has a very specific short name that matches our pattern
    // Use a higher threshold (6 chars) for reverse match to be more conservative
    const MIN_REVERSE_MATCH_LENGTH = 6;
    if (normalizedPattern.includes(normalizedIdentifier)) {
      if (normalizedIdentifier.length >= MIN_REVERSE_MATCH_LENGTH) {
        // Cap coverage at 1.0 to keep score in documented range
        const coverage = Math.min(1, normalizedIdentifier.length / normalizedPattern.length);
        return 30 + (coverage * 30); // Score range: 30-60
      }
    }
    
    // No match
    return 0;
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
