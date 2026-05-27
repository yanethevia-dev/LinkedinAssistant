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
          margin: 2cm;
        }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #333;
          max-width: 21cm;
          margin: 0 auto;
        }
        h1 {
          font-size: 24pt;
          font-weight: bold;
          margin-bottom: 8pt;
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 8pt;
        }
        h2 {
          font-size: 14pt;
          font-weight: bold;
          margin-top: 16pt;
          margin-bottom: 8pt;
          color: #34495e;
          text-transform: uppercase;
          letter-spacing: 1pt;
        }
        p {
          margin: 8pt 0;
        }
        ul {
          margin: 8pt 0;
          padding-left: 20pt;
        }
        li {
          margin: 6pt 0;
        }
        .section {
          page-break-inside: avoid;
        }
        .experience-item, .education-item {
          margin: 12pt 0;
          page-break-inside: avoid;
        }
        .job-title {
          font-weight: bold;
          font-size: 12pt;
        }
        .company {
          font-style: italic;
          color: #555;
        }
        .dates {
          color: #777;
          font-size: 10pt;
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
  let isFirstSection = true;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      continue;
    }

    // Detect name (first line, usually)
    if (isFirstSection && lines.indexOf(line) === 0) {
      html += `<h1>${escapeHtml(trimmed)}</h1>`;
      isFirstSection = false;
      continue;
    }

    // Detect sections (ALL CAPS or ends with :)
    if (/^[A-ZÁÉÍÓÚÑ\s]{3,}$/.test(trimmed) || trimmed.endsWith(':')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      const sectionTitle = trimmed.replace(':', '');
      html += `<div class="section"><h2>${escapeHtml(sectionTitle)}</h2>`;
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
      html += '</ul></div>';
      inList = false;
    }
    html += `<p>${escapeHtml(trimmed)}</p>`;
  }

  if (inList) {
    html += '</ul></div>';
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
