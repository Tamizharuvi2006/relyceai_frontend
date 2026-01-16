import jsPDF from 'jspdf';

/**
 * pdfGenerator.js
 * Self-contained PDF generator utility using jsPDF.
 * Exports: generateChatPDF, downloadPDF, generateAndDownloadChatPDF
 *
 * Usage:
 * import { generateAndDownloadChatPDF } from './pdfGenerator.js';
 * generateAndDownloadChatPDF(messagesArray, metadataObject, 'filename.pdf');
 */

/**
 * Clean markdown text for PDF output and fix encoding issues
 * @param {string} text
 * @returns {string}
 */
function cleanMarkdownText(text = '') {
  // First decode any HTML entities
  let decodedText = String(text);
  
  // Fix common encoding issues
  decodedText = decodedText
    .replace(/Ø=/g, '') // Remove encoding artifacts
    .replace(/ÜI/g, '') // Remove encoding artifacts
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
    .replace(/\u00D8/g, '') // Remove specific encoding artifacts
    .replace(/\u00DC/g, '') // Remove specific encoding artifacts
    .replace(/\u00C2/g, '') // Remove specific encoding artifacts
    .trim();
  
  // Clean markdown
  decodedText = decodedText
    .replace(/\r\n/g, '\n')
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1') // italic
    .replace(/`(.*?)`/g, '$1') // inline code
    .replace(/~~(.*?)~~/g, '$1') // strike
    .replace(/^\s*######\s*(.*?)\s*$/gm, '$1')
    .replace(/^\s*#####\s*(.*?)\s*$/gm, '$1')
    .replace(/^\s*####\s*(.*?)\s*$/gm, '$1')
    .replace(/^\s*###\s*(.*?)\s*$/gm, '$1')
    .replace(/^\s*##\s*(.*?)\s*$/gm, '$1')
    .replace(/^\s*#\s*(.*?)\s*$/gm, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
    .replace(/[\t\u00A0]+/g, ' ')
    .replace(/\s+$/gm, '')
    .trim();
  
  return decodedText;
}

/**
 * Split text into lines
 * @param {string} text
 * @returns {string[]}
 */
function splitTextIntoLines(text = '') {
  return String(text)
    .split('\n')
    .map(line => line.replace(/\s+$/g, ''))
    .filter(line => line !== undefined);
}

/**
 * Draw header banner
 */
function drawHeader(doc, pageWidth, title) {
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 0, pageWidth, 18, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text(title || 'Chat Export', pageWidth / 2, 12, { align: 'center' });
  doc.setTextColor(0, 0, 0);
}

/**
 * Create a simple table representation in PDF
 * @param {jsPDF} doc
 * @param {Array<Array<string>>} tableData
 * @param {number} startX
 * @param {number} startY
 * @param {number} pageWidth
 * @param {number} pageHeight
 */
function drawSimpleTable(doc, tableData, startX, startY, pageWidth, pageHeight) {
  let y = startY;
  const cellHeight = 15;
  const cellPadding = 3;
  
  // Calculate column widths
  if (tableData.length === 0) return y;
  
  const colCount = Math.max(...tableData.map(row => row.length));
  const cellWidth = (pageWidth - startX - 40) / Math.max(colCount, 1);
  
  // Draw table rows
  for (let i = 0; i < tableData.length; i++) {
    const row = tableData[i];
    
    // Check for page break
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 36;
    }
    
    // Draw each cell
    for (let j = 0; j < colCount; j++) {
      const cellText = j < row.length ? row[j] : '';
      const x = startX + j * cellWidth;
      
      // Draw cell border
      doc.setDrawColor(16, 185, 129); // emerald-500
      doc.setLineWidth(0.5);
      doc.rect(x, y, cellWidth, cellHeight);
      
      // Draw cell text
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      const textLines = doc.splitTextToSize(cellText, cellWidth - 2 * cellPadding);
      doc.text(textLines, x + cellPadding, y + cellPadding + 3);
    }
    
    y += cellHeight;
  }
  
  return y;
}

/**
 * Generate a PDF (blob) from chat messages
 * @param {Array<{role: string, content: string, text?: string, name?: string, time?: string}>} messages
 * @param {{title?: string, date?: string, participants?: string[]}} metadata
 * @returns {Promise<Blob>}
 */
export const generateChatPDF = async (messages = [], metadata = {}) => {
  try {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 36; // start below header

    // Draw header
    drawHeader(doc, pageWidth, metadata.title || 'Chat Export');

    // Title block
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(metadata.title || 'Conversation', 40, y);
    y += 18;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    if (metadata.date) {
      const dateStr = `Date: ${new Date(metadata.date).toLocaleString()}`;
      doc.text(dateStr, 40, y);
      y += 14;
    }
    if (metadata.participants && Array.isArray(metadata.participants)) {
      doc.text(`Participants: ${metadata.participants.join(', ')}`, 40, y);
      y += 16;
    }

    // Separator
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(36, y, pageWidth - 36, y);
    y += 18;

    // Process messages
    const validMessages = Array.isArray(messages)
      ? messages.filter(m => m && (m.content || m.text || m.message))
      : [];

    doc.setFontSize(11);

    for (let i = 0; i < validMessages.length; i++) {
      const msg = validMessages[i];

      // Page break handling
      if (y > pageHeight - 60) {
        doc.addPage();
        drawHeader(doc, pageWidth, metadata.title || 'Chat Export');
        y = 36 + 18; // header + small top margin
      }

      const role = (msg.role || msg.name || '').toString().toLowerCase();
      const sender = role === 'user' || role === 'you' ? 'You' : 'Relyce AI';
      const rawText = msg.content || msg.text || msg.message || '';
      if (!String(rawText).trim()) continue;

      // Sender label
      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text(`${sender}:`, 40, y);
      y += 12;

      // Message content
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const cleanText = cleanMarkdownText(rawText);
      const lines = splitTextIntoLines(cleanText);
      
      // Check for table format
      const looksLikeTable = lines.some(l => l.includes('|') && /-+/.test(l));

      if (looksLikeTable) {
        // Process table data
        const tableData = [];
        
        for (let r = 0; r < lines.length; r++) {
          const line = lines[r];
          // Skip separator lines
          if (line.includes('|') && !/^\s*\|[-|\s:]+\|\s*$/.test(line)) {
            const cells = line.split('|').map(c => c.trim()).filter(Boolean);
            tableData.push(cells);
          }
        }
        
        // Draw simple table
        if (tableData.length > 0) {
          const tableEndY = drawSimpleTable(doc, tableData, 48, y, pageWidth, pageHeight);
          y = tableEndY + 15;
        } else {
          // Fallback for malformed tables
          const wrapped = doc.splitTextToSize(cleanText, pageWidth - 80);
          doc.text(wrapped, 48, y);
          y += wrapped.length * 12 + 8;
        }
      } else {
        // Regular text message
        const wrapped = doc.splitTextToSize(cleanText, pageWidth - 80);
        doc.text(wrapped, 48, y);
        y += wrapped.length * 12 + 8;
      }

      // Spacing between messages
      y += 12;
    }

    const blob = doc.output('blob');
    return blob;
  } catch (err) {
    console.error('PDF generation error', err);
    throw err;
  }
};

/**
 * Trigger browser download for a Blob
 * @param {Blob} blob
 * @param {string} filename
 */
export const downloadPDF = (blob, filename = 'chat-export.pdf') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Convenience: generate PDF and trigger download
 * @param {Array} messages
 * @param {Object} metadata
 * @param {string} filename
 */
export const generateAndDownloadChatPDF = async (messages = [], metadata = {}, filename = 'chat-export.pdf') => {
  const blob = await generateChatPDF(messages, metadata);
  downloadPDF(blob, filename);
};

export default {
  generateChatPDF,
  downloadPDF,
  generateAndDownloadChatPDF
};