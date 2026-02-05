import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getUserFiles, deleteFileMetadata } from '../services/fileService';
import { deleteFile } from '../../../utils/api'; // Stub - backend not connected
import { FileText, Image, Download, Trash2, RefreshCw, Check } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const UserFiles = () => {
  const { userProfile } = useAuth();
  const { theme } = useTheme();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState(new Set()); // Track selected files
  const [deleting, setDeleting] = useState(false); // Track deletion status
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' }); // Custom notifications

  useEffect(() => {
    loadUserFiles();
  }, [userProfile]);

  const loadUserFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('=== Loading user files ===');
      console.log('User profile:', userProfile);
      console.log('User ID:', userProfile?.uid);

      if (userProfile?.uid) {
        console.log('Fetching files for user ID:', userProfile.uid);
        const userFiles = await getUserFiles(userProfile.uid);
        console.log('Retrieved files:', userFiles);
        console.log('Number of files retrieved:', userFiles.length);

        // Log each file's properties
        userFiles.forEach((file, index) => {
          console.log(`File ${index + 1}:`, {
            id: file.id,
            fileName: file.fileName,
            originalName: file.originalName,
            fileSize: file.fileSize,
            fileType: file.fileType,
            uploadDate: file.uploadDate,
            backendOnly: file.backendOnly,
            backendPath: file.backendPath
          });
        });

        setFiles(userFiles);
        console.log('Files state updated with', userFiles.length, 'files');
      } else {
        console.log('No user ID found for file retrieval');
        console.log('User profile:', userProfile);
      }
    } catch (err) {
      console.error('Error loading user files:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack
      });
      setError('Failed to load files. Please try again.');
    } finally {
      setLoading(false);
      console.log('=== Finished loading user files ===');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) {
      return <Image size={20} className="text-blue-400" />;
    } else if (fileType === 'application/pdf') {
      return <FileText size={20} className="text-red-400" />;
    } else {
      return <FileText size={20} className="text-gray-400" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Toggle file selection
  const toggleFileSelection = (fileId) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  // Select all files
  const selectAllFiles = () => {
    if (selectedFiles.size === files.length) {
      // If all are selected, deselect all
      setSelectedFiles(new Set());
    } else {
      // Select all files
      setSelectedFiles(new Set(files.map(file => file.id)));
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Delete selected files
  const deleteSelectedFiles = async () => {
    if (selectedFiles.size === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedFiles.size} file(s)?`)) {
      return;
    }

    setDeleting(true);
    try {
      // Delete each selected file
      const deletePromises = [];
      const filesToDelete = files.filter(file => selectedFiles.has(file.id));

      for (const file of filesToDelete) {
        // Use the backendPath to extract the actual filename with timestamp prefix
        let fileName = file.originalName || file.fileName;

        // If we have backendPath, extract just the filename part from it
        if (file.backendPath) {
          // Extract just the filename part from the full path
          // Handle both Unix and Windows path separators
          const pathParts = file.backendPath.split(/[/\\]/);
          fileName = pathParts[pathParts.length - 1];
        }

        const deletePromise = deleteFile(fileName);
        deletePromises.push(deletePromise);
      }

      // Wait for all deletions to complete
      const results = await Promise.all(deletePromises);

      // Capture uid locally to prevent null access if logout occurs mid-flight
      const uid = userProfile?.uid;
      if (!uid) {
        console.error('User ID not available during deletion');
        showNotification('Cannot delete files: user not authenticated', 'error');
        setIsDeleting(false);
        return;
      }

      // Check for any errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Some files failed to delete:', errors);
        showNotification(`Failed to delete ${errors.length} file(s). Please try again.`, 'error');
      } else {
        // Delete Firestore metadata for each file
        const metadataDeletePromises = filesToDelete.map(file =>
          deleteFileMetadata(uid, file.id)
        );
        await Promise.all(metadataDeletePromises);

        showNotification(`Successfully deleted ${filesToDelete.length} file(s)`, 'success');
      }

      // Remove deleted files from state
      setFiles(prevFiles => prevFiles.filter(file => !selectedFiles.has(file.id)));

      // Clear selection
      setSelectedFiles(new Set());

      console.log(`Successfully deleted ${filesToDelete.length} file(s)`);
    } catch (err) {
      console.error('Error deleting files:', err);
      showNotification('Failed to delete files. Please try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Delete a single file
  const deleteSingleFile = async (file) => {
    if (!window.confirm(`Are you sure you want to delete ${file.originalName || file.fileName}?`)) {
      return;
    }

    setDeleting(true);
    try {
      // Use the backendPath to extract the actual filename with timestamp prefix
      let fileName = file.originalName || file.fileName;

      // If we have backendPath, extract just the filename part from it
      if (file.backendPath) {
        // Extract just the filename part from the full path
        // Handle both Unix and Windows path separators
        const pathParts = file.backendPath.split(/[/\\]/);
        fileName = pathParts[pathParts.length - 1];
      }

      const result = await deleteFile(fileName);

      if (result.error) {
        console.error('Failed to delete file:', result.error);
        showNotification('Failed to delete file. Please try again.', 'error');
        return;
      }

      // Delete Firestore metadata
      await deleteFileMetadata(userProfile.uid, file.id);

      // Remove file from state
      setFiles(prevFiles => prevFiles.filter(f => f.id !== file.id));

      // Remove from selection if it was selected
      if (selectedFiles.has(file.id)) {
        const newSelected = new Set(selectedFiles);
        newSelected.delete(file.id);
        setSelectedFiles(newSelected);
      }

      showNotification(`Successfully deleted ${file.originalName || file.fileName}`, 'success');
      console.log(`Successfully deleted file: ${fileName}`);
    } catch (err) {
      console.error('Error deleting file:', err);
      showNotification('Failed to delete file. Please try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      // For backend-only files - backend not connected
      if (file.backendOnly && file.backendPath) {
        alert('Backend not connected. Cannot download backend-only files until new backend is integrated.');
        return;
      } else if (file.downloadURL) {
        // For Firebase Storage files, use the download URL
        window.open(file.downloadURL, '_blank');
      } else {
        // No download URL available
        alert('Backend not connected. Please integrate your new backend for file downloads.');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file. Please try again.');
    }
  };

  if (loading || deleting) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        {deleting && <p className="mt-4">Deleting files...</p>}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg p-6 text-center ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-slate-200'
        }`}>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={loadUserFiles}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-opacity duration-300 ${notification.type === 'success'
          ? 'bg-emerald-500 text-white'
          : 'bg-red-500 text-white'
          }`}>
          {notification.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">My Files</h1>
        <div className="flex flex-wrap gap-2">
          {selectedFiles.size > 0 && (
            <button
              onClick={deleteSelectedFiles}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 size={16} />
              Delete ({selectedFiles.size})
            </button>
          )}
          <button
            onClick={selectAllFiles}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <Check size={16} />
            {selectedFiles.size === files.length && files.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={loadUserFiles}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {files.length === 0 ? (
        <div className={`rounded-lg p-12 text-center ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-slate-200'
          }`}>
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No files uploaded yet</h3>
          <p className={`mb-6 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'
            }`}>
            Upload files through the chat interface to see them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <div
              key={file.id}
              className={`rounded-lg border p-6 transition-all hover:shadow-lg relative ${selectedFiles.has(file.id)
                ? (theme === 'dark' ? 'ring-2 ring-emerald-500 bg-zinc-800/50' : 'ring-2 ring-emerald-500 bg-white')
                : ''
                } ${theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 hover:border-emerald-500'
                  : 'bg-white border-slate-200 hover:border-emerald-400'
                }`}
            >
              {/* Selection checkbox */}
              <button
                onClick={() => toggleFileSelection(file.id)}
                className={`absolute top-3 left-3 w-5 h-5 rounded border flex items-center justify-center ${selectedFiles.has(file.id)
                  ? 'bg-emerald-500 border-emerald-500'
                  : theme === 'dark'
                    ? 'border-zinc-600 hover:border-zinc-500'
                    : 'border-slate-300 hover:border-slate-400'
                  }`}
              >
                {selectedFiles.has(file.id) && <Check size={14} className="text-white" />}
              </button>

              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-zinc-700 ml-8">
                  {getFileIcon(file.fileType)}
                </div>
                <button
                  onClick={() => deleteSingleFile(file)}
                  disabled={deleting}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-50"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>

              <h3 className="font-semibold mb-2 truncate">{file.originalName || file.fileName}</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}>Size:</span>
                  <span>{formatFileSize(file.fileSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}>Uploaded:</span>
                  <span>{formatDate(file.uploadDate)}</span>
                </div>
                {file.backendOnly && (
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}>Storage:</span>
                    <span className="text-emerald-500">Backend Only</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => handleDownload(file)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserFiles;
