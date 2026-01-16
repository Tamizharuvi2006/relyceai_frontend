import React from 'react';
import { generateChatPDF, downloadPDF } from '../utils/pdfGenerator';

// Sample test messages
const testMessages = [
  {
    id: '1',
    role: 'user',
    content: 'Hello, can you help me with my project?',
    timestamp: new Date(Date.now() - 3600000) // 1 hour ago
  },
  {
    id: '2',
    role: 'bot',
    content: 'Of course! I\'d be happy to help you with your project. What specifically do you need assistance with?',
    timestamp: new Date(Date.now() - 3500000) // 1 hour ago
  },
  {
    id: '3',
    role: 'user',
    content: 'I\'m working on a React application and need help with state management.',
    timestamp: new Date(Date.now() - 3400000) // 58 minutes ago
  },
  {
    id: '4',
    role: 'bot',
    content: 'React state management is an important topic. There are several approaches you can take:\n\n1. **Local component state** - Using useState hook for simple state\n2. **Context API** - For sharing state across components\n3. **Redux** - For complex applications with large state\n4. **Zustand or Jotai** - Modern lightweight alternatives\n\nWhich approach interests you most?',
    timestamp: new Date(Date.now() - 3300000) // 55 minutes ago
  }
];

const TestPdfPage = () => {
  const handleGeneratePDF = async () => {
    try {
      // Generate PDF with test messages
      const blob = await generateChatPDF(testMessages, {
        title: 'Test Chat Conversation',
        date: new Date(),
        participants: ['User', 'Relyce AI']
      });
      
      // Download the PDF
      downloadPDF(blob, 'test-chat-transcript.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please check the console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">PDF Generation Test</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Click the button below to test the PDF generation functionality with sample chat data.
        </p>
        
        <button
          onClick={handleGeneratePDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate Test PDF
        </button>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Sample Chat Data</h2>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
            {testMessages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-4 p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-green-100 dark:bg-green-900/30 ml-4' 
                    : 'bg-blue-100 dark:bg-blue-900/30 mr-4'
                }`}
              >
                <div className="font-semibold text-gray-700 dark:text-gray-200">
                  {message.role === 'user' ? 'You' : 'Relyce AI'}
                </div>
                <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPdfPage;