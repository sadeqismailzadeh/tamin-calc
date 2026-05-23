(function() {
  // ساختار ماژولار برای تعریف سایت‌های مختلف
  // برای اضافه کردن سایت جدید، کافیست یک آبجکت جدید به این آرایه اضافه کنید.
  const parsers = [
    {
      name: "Tamin (تامین اجتماعی)",
      matches: () => document.getElementById("ctl00_ContentPlaceHolder1_grdItems_DXMainTable") !== null,
      parse: parseTamin
    },
    {
      name: "IHIO (بیمه سلامت / خدمات درمانی)",
      matches: () => document.querySelector(".AvicoCMPTemplateTreeTable") !== null,
      parse: parseIhio
    }
  ];

  let extractedData = null;
  let matchedSite = null;

  // پیدا کردن پارسر مناسب بر اساس المان‌های موجود در صفحه فعلی
  for (const parser of parsers) {
    if (parser.matches()) {
      extractedData = parser.parse();
      matchedSite = parser.name;
      break;
    }
  }

  // اگر هیچ ساختاری با سایت‌های تعریف شده مطابقت نداشت
  if (!extractedData) {
    alert("ساختار جدول داروها در این صفحه یافت نشد یا سایت پشتیبانی نمی‌شود.");
    return;
  }

  // ارسال داده‌ها برای چاپ
  if (extractedData.length > 0) {
    chrome.runtime.sendMessage({ action: "open_print_page", data: extractedData });
  } else {
    alert(`هیچ داده دارویی در سایت ${matchedSite} استخراج نشد.`);
  }

  // ==========================================
  // توابع استخراج (Parsers) اختصاصی هر سایت
  // ==========================================

  function parseTamin() {
    const table = document.getElementById("ctl00_ContentPlaceHolder1_grdItems_DXMainTable");
    const rows = table.querySelectorAll("tr[id*='_DXDataRow']");
    const data = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll("td.dxgv");
      if (cells.length >= 12) {
        const code = cells[1].innerText.trim();
        const name = cells[2].innerText.trim();
        const qty = parseInt(cells[3].innerText.trim(), 10) || 0;
        
        const total = parseFloat(cells[6].innerText.trim().replace(/,/g, '')) || 0;
        const orgPaid = parseFloat(cells[7].innerText.trim().replace(/,/g, '')) || 0;
        const officialPercent = total > 0 ? ((orgPaid / total) * 100).toFixed(7) : "0.0000000";

        data.push({ code, name, qty, total, orgPaid, officialPercent });
      }
    });
    return data;
  }

  function parseIhio() {
    const data = [];
    // انتخاب سطرهای حاوی اطلاعات دارو (رد کردن سطر جمع کل که اتریبیوت iscombineddrug ندارد)
    const rows = document.querySelectorAll(".AvicoCMPTemplateTreeTable table tbody tr[avi-t='p'][iscombineddrug]");

    rows.forEach(row => {
      // رفع باگ جداول تو در تو با استفاده از سلکتور :scope > td
      // این سلکتور فقط td های فرزند مستقیم سطر اصلی را برمی‌گرداند (دقیقا ۱۲ ستون اصلی)
      const cells = row.querySelectorAll(":scope > td");
      if (cells.length < 8) return;

      // 1. کد دارو: ستون اول (ایندکس 0) یا اتریبیوت سطر
      let code = row.getAttribute("nationalnumber") || "";
      if (!code) {
        const codeSpan = cells[0].querySelector("span");
        code = codeSpan ? codeSpan.innerText.trim() : cells[0].innerText.trim();
      }

      // 2. نام دارو: ستون دوم (ایندکس 1)
      const nameSpan = cells[1].querySelector("span");
      const name = nameSpan ? nameSpan.innerText.trim() : cells[1].innerText.trim();

      // 3. تعداد ارائه شده: ستون چهارم (ایندکس 3) و در صورت خالی بودن ستون سوم (ایندکس 2)
      let qty = parseInt(cells[3].innerText.trim(), 10);
      if (isNaN(qty)) {
        qty = parseInt(cells[2].innerText.trim(), 10) || 0; 
      }

      // 4. مبالغ: استفاده از اتریبیوت‌های دقیق سطر (amount و orgamount)
      let total = parseFloat(row.getAttribute("amount"));
      if (isNaN(total)) {
        total = parseFloat(cells[5].innerText.trim().replace(/,/g, '')) || 0;
      }

      let orgPaid = parseFloat(row.getAttribute("orgamount"));
      if (isNaN(orgPaid)) {
        orgPaid = parseFloat(cells[7].innerText.trim().replace(/,/g, '')) || 0;
      }

      const officialPercent = total > 0 ? ((orgPaid / total) * 100).toFixed(7) : "0.0000000";

      data.push({ code, name, qty, total, orgPaid, officialPercent });
    });
    
    return data;
  }
})();
