chrome.action.onClicked.addListener((tab) => {
  if (!tab.url) return;

  // لیست دامنه‌های مجاز. برای اضافه کردن سایت‌های جدید در آینده، دامنه را اینجا اضافه کنید.
  const allowedDomains = [
    "tamin.ir",             // سایت تامین اجتماعی
    "ihio.gov.ir"           // سایت بیمه سلامت / خدمات درمانی / نیروهای مسلح
  ];

  const isAllowed = allowedDomains.some(domain => tab.url.includes(domain));

  // اجازه اجرا روی سایت‌های مجاز یا فایل‌های لوکال (برای تست)
  if (isAllowed || tab.url.startsWith("file://")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  } else {
    console.warn("این افزونه فقط برای سایت‌های مشخص شده مجاز به اجرا می‌باشد.");
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "open_print_page") {
    chrome.storage.local.set({ prescriptionData: message.data }, () => {
      chrome.tabs.create({ url: chrome.runtime.getURL("print.html") });
    });
  }
});