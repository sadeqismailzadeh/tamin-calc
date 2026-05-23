document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("prescriptionData", (result) => {
    const data = result.prescriptionData;
    if (!data) return;

    const tbody = document.querySelector("#resultTable tbody");
    let sumTotal = 0;
    let sumOrgPaid = 0;

    data.forEach(item => {
      sumTotal += item.total;
      sumOrgPaid += item.orgPaid;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.code}</td>
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>${formatNumber(item.total)}</td>
        <td>${formatNumber(item.orgPaid)}</td>
        <td style="font-weight: bold; color: #0056b3; font-size: 14px;">${item.officialPercent}%</td>
      `;
      tbody.appendChild(row);
    });

    // Calculate final summary percentage to 7 decimal places
    const finalOfficialPercent = sumTotal > 0 ? ((sumOrgPaid / sumTotal) * 100).toFixed(7) : "0.0000000";

    const totalRow = document.createElement("tr");
    totalRow.className = "total-row";
    totalRow.innerHTML = `
      <td colspan="3">جمع کل اقلام</td>
      <td>${formatNumber(sumTotal)}</td>
      <td>${formatNumber(sumOrgPaid)}</td>
      <td style="font-weight: bold; color: #0056b3; font-size: 14px;">${finalOfficialPercent}%</td>
    `;
    tbody.appendChild(totalRow);
  });
});

// Formats numbers with English digits and commas
function formatNumber(num) {
  return num.toLocaleString('en-US');
}