chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes("tamin.ir")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  } else {
    // Falls back to local test files if running on mhtml on local machine
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "open_print_page") {
    chrome.storage.local.set({ prescriptionData: message.data }, () => {
      chrome.tabs.create({ url: chrome.runtime.getURL("print.html") });
    });
  }
});