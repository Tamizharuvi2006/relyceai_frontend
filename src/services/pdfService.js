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

  static downloadPDF(blob, filename) {
    downloadPDF(blob, filename);
  }

  static async generateAndDownloadChatPDF(messages, metadata, filename) {
    const blob = await this.generateChatPDF(messages, metadata);
    this.downloadPDF(blob, filename);
  }
}

export default PDFService;