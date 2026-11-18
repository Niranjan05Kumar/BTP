/**
 * Robust CSV Export Utility
 * Handles header generation, cell quoting, date formatting, and file download.
 */

export const exportToCsv = (data, filename = "mining_dashboard_export.csv", customHeaders = null) => {
  if (!Array.isArray(data) || data.length === 0) {
    alert("No data available to export.");
    return false;
  }

  const keys = customHeaders ? Object.keys(customHeaders) : Object.keys(data[0]);
  const headerLabels = customHeaders ? Object.values(customHeaders) : keys;

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    let str = typeof val === "object" ? JSON.stringify(val) : String(val);
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [];
  // Add Header Row
  csvRows.push(headerLabels.map((h) => `"${h.replace(/"/g, '""')}"`).join(","));

  // Add Data Rows
  for (const row of data) {
    const values = keys.map((key) => escapeCell(row[key]));
    csvRows.push(values.join(","));
  }

  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
};

