// Popup script for managing resume data and triggering form fill

document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('fileInput');
  const loadSampleBtn = document.getElementById('loadSample');
  const fillFormBtn = document.getElementById('fillForm');
  const clearDataBtn = document.getElementById('clearData');
  const statusDiv = document.getElementById('status');
  const dataPreview = document.getElementById('dataPreview');

  // Load and display current resume data
  loadCurrentData();

  // File input handler
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const resumeData = JSON.parse(event.target.result);
          saveResumeData(resumeData);
          showStatus('Resume data loaded successfully!', 'success');
          loadCurrentData();
        } catch (error) {
          showStatus('Error parsing JSON file: ' + error.message, 'error');
        }
      };
      reader.readAsText(file);
    }
  });

  // Load sample resume
  loadSampleBtn.addEventListener('click', function() {
    fetch('sample-resume.json')
      .then(response => response.json())
      .then(data => {
        saveResumeData(data);
        showStatus('Sample resume loaded successfully!', 'success');
        loadCurrentData();
      })
      .catch(error => {
        showStatus('Error loading sample: ' + error.message, 'error');
      });
  });

  // Fill form button
  fillFormBtn.addEventListener('click', function() {
    chrome.storage.sync.get(['resumeData'], function(result) {
      if (!result.resumeData) {
        showStatus('Please load resume data first!', 'error');
        return;
      }

      // Send message to content script
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {action: 'fillForm', data: result.resumeData},
          function(response) {
            if (chrome.runtime.lastError) {
              showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
            } else if (response && response.success) {
              showStatus(response.message, 'success');
            } else {
              showStatus('Failed to fill form', 'error');
            }
          }
        );
      });
    });
  });

  // Clear data button
  clearDataBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all resume data?')) {
      chrome.storage.sync.remove('resumeData', function() {
        showStatus('Resume data cleared', 'info');
        dataPreview.style.display = 'none';
      });
    }
  });

  // Helper functions
  function saveResumeData(data) {
    chrome.storage.sync.set({resumeData: data});
  }

  function loadCurrentData() {
    chrome.storage.sync.get(['resumeData'], function(result) {
      if (result.resumeData) {
        displayDataPreview(result.resumeData);
      }
    });
  }

  function displayDataPreview(data) {
    dataPreview.style.display = 'block';
    document.getElementById('previewName').textContent = 
      data.personal?.fullName || data.personal?.firstName + ' ' + data.personal?.lastName || 'N/A';
    document.getElementById('previewEmail').textContent = data.personal?.email || 'N/A';
    document.getElementById('previewPhone').textContent = data.personal?.phone || 'N/A';
  }

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
    setTimeout(() => {
      statusDiv.className = 'status';
    }, 5000);
  }
});
