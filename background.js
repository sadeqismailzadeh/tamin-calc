chrome.action.onClicked.addListener((tab) => {
  if (!tab.url) return;

  // لیست دامنه‌های مجاز. برای اضافه کردن سایت‌های جدید در آینده، دامنه را اینجا اضافه کنید.
  const allowedDomains = [
    "tamin.ir",             // سایت تامین اجتماعی
    "ihio.gov.ir",          // سایت بیمه سلامت / خدمات درمانی
    "esakhad.esata.ir"      // سایت بیمه نیروهای مسلح
  ];

  const isAllowed = allowedDomains.some(domain => tab.url.includes(domain));

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
    // ۱. ابتدا داده‌های جدید را در حافظه ذخیره می‌کنیم
    chrome.storage.local.set({ prescriptionData: message.data }, () => {
      
      const printUrl = chrome.runtime.getURL("print.html");
      
      // ۲. در میان زبانه‌های باز به دنبال صفحه پرینت می‌گردیم
      chrome.tabs.query({ url: printUrl }, (tabs) => {
        if (tabs.length > 0) {
          // اگر صفحه از قبل باز بود:
          const existingTab = tabs[0];
          
          // اطلاعات صفحه را رفرش کن تا داده‌های جدید را از حافظه بخواند
          chrome.tabs.reload(existingTab.id);
          
          // زبانه را فعال و به کاربر نمایش بده
          chrome.tabs.update(existingTab.id, { active: true });
          
          // پنجره مرورگری که زبانه در آن است را هم فوکوس کن (برای زمانی که چند پنجره باز است)
          chrome.windows.update(existingTab.windowId, { focused: true });
        } else {
          // اگر صفحه باز نبود، یک زبانه جدید ایجاد کن
          chrome.tabs.create({ url: printUrl });
        }
      });
      
    });
  }
});