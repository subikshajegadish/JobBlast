// Background service worker for the extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('Job Application Tracker extension installed');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveApplication') {
    // This could be used for future auto-save functionality
    console.log('Application data received:', request.data);
  }
  return true;
});

