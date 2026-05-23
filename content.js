(function() {
  const table = document.getElementById("ctl00_ContentPlaceHolder1_grdItems_DXMainTable");
  if (!table) {
    alert("Prescription table not found on this page!");
    return;
  }

  const rows = table.querySelectorAll("tr[id*='_DXDataRow']");
  const extractedData = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll("td.dxgv");
    if (cells.length >= 12) {
      const code = cells[1].innerText.trim();
      const name = cells[2].innerText.trim();
      const qty = parseInt(cells[3].innerText.trim(), 10) || 0;
      
      // Extract Total Price (index 6) and Org Paid Amount (index 7)
      const total = parseFloat(cells[6].innerText.trim().replace(/,/g, '')) || 0;
      const orgPaid = parseFloat(cells[7].innerText.trim().replace(/,/g, '')) || 0;

      // Calculate percentage to 7 decimal places
      const officialPercent = total > 0 ? ((orgPaid / total) * 100).toFixed(7) : "0.0000000";

      extractedData.push({
        code,
        name,
        qty,
        total,
        orgPaid,
        officialPercent
      });
    }
  });

  if (extractedData.length > 0) {
    chrome.runtime.sendMessage({ action: "open_print_page", data: extractedData });
  } else {
    alert("No drug data could be retrieved.");
  }
})();