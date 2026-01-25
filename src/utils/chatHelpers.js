// utils/chatHelpers.js

/**
 * Get file icon based on file type
 * @param {string} fileType - MIME type of the file
 * @returns {JSX.Element} Icon component
 */
export const getFileIcon = (fileType) => {
  // These imports would normally be at the top, but we're just exporting functions
  // import { Image, FileText } from 'lucide-react';

  if (fileType.startsWith('image/')) {
    return { type: 'image', className: 'text-blue-400' }; // <Image size={16} className="text-blue-400" />
  } else if (fileType === 'application/pdf') {
    return { type: 'pdf', className: 'text-red-400' }; // <FileText size={16} className="text-red-400" />
  } else {
    return { type: 'file', className: 'text-gray-400' }; // <FileText size={16} className="text-gray-400" />
  }
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};