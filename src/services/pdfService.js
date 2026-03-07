import { generateChatPDF, downloadPDF } from '../utils/pdfGenerator';

class PDFService {
  static async generateChatPDF(messages, metadata) {
    if (!messages || messages.length === 0) {
      throw new Error('No chat to download!');
    }
    return await generateChatPDF(messages, {
      title: metadata.title || 'Chat Conversation',
      date: metadata.date || new Date(),
      participants: metadata.participants || ['User', 'Relyce AI']
    });
  }

  static async generateTextPDF(content, metadata = {}) {
    const text = String(content || '').trim();
    if (!text) {
      throw new Error('No content to convert to PDF.');
    }
    const pseudoMessages = [{ role: 'user', content: text }];
    return await generateChatPDF(pseudoMessages, {
      title: metadata.title || 'Document Export',
      date: metadata.date || new Date(),
      participants: metadata.participants || ['Relyce AI']
    });
  }

  static downloadPDF(blob, filename) {
    downloadPDF(blob, filename);
  }

  static async generateAndDownloadTextPDF(content, metadata = {}, filename = 'document-export.pdf') {
    const blob = await this.generateTextPDF(content, metadata);
    this.downloadPDF(blob, filename);
    return blob;
  }

  static async generateAndDownloadChatPDF(messages, metadata, filename) {
    const blob = await this.generateChatPDF(messages, metadata);
    this.downloadPDF(blob, filename);
  }
}

export default PDFService;
