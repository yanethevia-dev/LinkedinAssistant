// CV Export utilities - PDF, Word, Text

/**
 * Download CV as plain text file
 */
export function downloadAsTxt(cvText: string, filename: string = 'CV') {
  const blob = new Blob([cvText], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${filename}.txt`);
}

/**
 * Download CV as Word document (.docx)
 * Uses simple HTML to Word conversion
 */
export function downloadAsWord(cvText: string, filename: string = 'CV') {
  // Convert plain text to HTML with proper formatting
  const htmlContent = textToHtmlForWord(cvText);

  // Create Word document using HTML
  const blob = new Blob(
    [
      `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>CV</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.6; }
          h1 { font-size: 20pt; font-weight: bold; margin-bottom: 8pt; }
          h2 { font-size: 14pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; }
          p { margin: 6pt 0; }
          ul { margin: 6pt 0; padding-left: 20pt; }
          li { margin: 4pt 0; }
          .section-divider { border-bottom: 1px solid #ccc; margin: 12pt 0; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>`
    ],
    { type: 'application/vnd.ms-word' }
  );

  downloadBlob(blob, `${filename}.doc`);
}

/**
 * Download CV as PDF
 * Opens a print dialog which allows saving as PDF
 */
export function downloadAsPDF(cvText: string, filename: string = 'CV') {
  // Create a hidden iframe with the CV content
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    alert('No se pudo crear el PDF. Intenta copiar el texto y usar un generador de PDF online.');
    document.body.removeChild(iframe);
    return;
  }

  // Write HTML content
  const htmlContent = textToHtmlForPDF(cvText);
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CV - ${filename}</title>
      <style>
        @page {
          size: A4;
          margin: 1.5cm 2cm;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
        }
        body {
          font-family: 'Segoe UI', 'Calibri', Arial, sans-serif;
          font-size: 10.5pt;
          line-height: 1.5;
          color: #333;
          max-width: 100%;
          margin: 0;
          padding: 0;
        }
        h1 {
          font-size: 20pt;
          font-weight: bold;
          margin: 0 0 6pt 0;
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 6pt;
          page-break-after: avoid;
        }
        h2 {
          font-size: 13pt;
          font-weight: bold;
          margin: 14pt 0 6pt 0;
          color: #34495e;
          text-transform: uppercase;
          letter-spacing: 0.5pt;
          page-break-after: avoid;
        }
        h3 {
          font-size: 11pt;
          font-weight: bold;
          margin: 8pt 0 4pt 0;
          color: #555;
          page-break-after: avoid;
        }
        p {
          margin: 4pt 0;
          orphans: 3;
          widows: 3;
        }
        ul {
          margin: 6pt 0;
          padding-left: 18pt;
        }
        li {
          margin: 3pt 0;
        }
        .section {
          margin-bottom: 10pt;
        }
        .experience-item, .education-item {
          margin: 8pt 0 12pt 0;
        }
        .job-title {
          font-weight: bold;
          font-size: 11pt;
          color: #2c3e50;
        }
        .company {
          font-style: italic;
          color: #555;
          font-size: 10pt;
        }
        .dates {
          color: #777;
          font-size: 9.5pt;
        }
        /* Prevent orphaned section headers */
        h1, h2, h3 {
          break-after: avoid-page;
        }
        /* Better paragraph breaks */
        p + h2 {
          margin-top: 16pt;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `);
  iframeDoc.close();

  // Wait for content to load, then print
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Remove iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };
}

/**
 * Convert plain text CV to HTML for Word
 */
function textToHtmlForWord(text: string): string {
  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += '<p>&nbsp;</p>';
      continue;
    }

    // Detect sections (ALL CAPS or ends with :)
    if (/^[A-ZÁÉÍÓÚÑ\s]{3,}$/.test(trimmed) || trimmed.endsWith(':')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      const sectionTitle = trimmed.replace(':', '');
      html += `<h2>${escapeHtml(sectionTitle)}</h2>`;
      continue;
    }

    // Detect list items (starts with • or -)
    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      const itemText = trimmed.substring(1).trim();
      html += `<li>${escapeHtml(itemText)}</li>`;
      continue;
    }

    // Regular paragraph
    if (inList) {
      html += '</ul>';
      inList = false;
    }
    html += `<p>${escapeHtml(trimmed)}</p>`;
  }

  if (inList) {
    html += '</ul>';
  }

  return html;
}

/**
 * Convert plain text CV to HTML for PDF
 */
function textToHtmlForPDF(text: string): string {
  const lines = text.split('\n');
  let html = '';
  let inList = false;
  let isFirstLine = true;
  let sectionOpen = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip multiple consecutive empty lines
    if (!trimmed) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (sectionOpen) {
        html += '</div>';
        sectionOpen = false;
      }
      continue;
    }

    // Detect name (first non-empty line)
    if (isFirstLine) {
      html += `<h1>${escapeHtml(trimmed)}</h1>`;
      isFirstLine = false;
      continue;
    }

    // Detect sections (ALL CAPS with 3+ letters, or ends with :, or starts with ===)
    const isAllCaps = /^[A-ZÁÉÍÓÚÑ\s]{3,}$/.test(trimmed);
    const endsWithColon = trimmed.endsWith(':') && trimmed.length > 3;
    const isDivider = trimmed.startsWith('===') || trimmed.startsWith('---');

    if (isAllCaps || endsWithColon || isDivider) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (sectionOpen) {
        html += '</div>';
      }

      if (isDivider) {
        continue; // Skip divider lines
      }

      const sectionTitle = trimmed.replace(':', '').trim();
      html += `<div class="section"><h2>${escapeHtml(sectionTitle)}</h2>`;
      sectionOpen = true;
      continue;
    }

    // Detect list items (starts with •, -, or ✓)
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('✓') || trimmed.startsWith('✅')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      let itemText = trimmed.substring(1).trim();
      // Handle ✅ (2 chars)
      if (trimmed.startsWith('✅')) {
        itemText = trimmed.substring(2).trim();
      }
      html += `<li>${escapeHtml(itemText)}</li>`;
      continue;
    }

    // Regular paragraph
    if (inList) {
      html += '</ul>';
      inList = false;
    }

    // Don't add excessive spacing
    if (trimmed.length > 0) {
      html += `<p>${escapeHtml(trimmed)}</p>`;
    }
  }

  // Close any open tags
  if (inList) {
    html += '</ul>';
  }
  if (sectionOpen) {
    html += '</div>';
  }

  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
