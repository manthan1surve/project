/**
 * exportService.js
 * Utility for exporting data as CSV or JSON files.
 */

export function exportToCSV(data, filename = 'audit_log.csv') {
  if (!data || !data.length) return;

  const headers = ['ID', 'Title', 'Department', 'Issue Date', 'Student Name', 'Student ID', 'Token ID', 'Transaction Hash'];
  
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(c => {
      const row = [
        c.id,
        `"${c.title}"`,
        `"${c.department}"`,
        c.issue_date,
        `"${c.student?.full_name || 'N/A'}"`,
        `"${c.student?.student_id_number || 'N/A'}"`,
        c.nft?.token_id || 'N/A',
        c.nft?.transaction_hash || 'N/A'
      ];
      return row.join(',');
    })
  ];

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(data, filename = 'audit_log.json') {
  if (!data || !data.length) return;

  // Add a signature/metadata for compliance
  const exportPayload = {
    metadata: {
      exported_at: new Date().toISOString(),
      system: "University NFT Certificate System",
      record_count: data.length,
      integrity: "SHA-256 (Simulated)"
    },
    records: data
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.click();
  URL.revokeObjectURL(url);
}
