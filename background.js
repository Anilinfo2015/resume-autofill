// Background service worker for the Chrome extension
// Note: Uses chrome.storage.local instead of chrome.storage.sync to avoid
// quota limits (sync has 8KB per-item limit). This means data won't sync
// across devices, but allows for larger resume data storage.

chrome.runtime.onInstalled.addListener(() => {
  console.log('Resume AutoFill extension installed');
  
  // Set default settings or perform initialization
  chrome.storage.local.get(['resumeData'], (result) => {
    if (!result.resumeData) {
      console.log('No resume data found. Please load your resume data.');
    } else {
      console.log('Resume data loaded successfully');
    }
  });

  // Create context menu
  chrome.contextMenus.create({
    id: 'fillForm',
    title: 'Fill form with resume data',
    contexts: ['editable']
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getResumeData') {
    chrome.storage.local.get(['resumeData'], (result) => {
      sendResponse({ data: result.resumeData });
    });
    return true; // Keep message channel open for async response
  }
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'fillForm') {
    chrome.storage.local.get(['resumeData'], (result) => {
      if (result.resumeData) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'fillForm',
          data: result.resumeData
        });
      }
    });
  }
});
