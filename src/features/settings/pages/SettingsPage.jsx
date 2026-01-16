import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { User, Lock, Trash2, CreditCard, ExternalLink, Bell, Shield, Globe, Download, AlertTriangle, X, Hash, Link as LinkIcon, Save, Loader2, Check, Edit2, MessageSquare, Camera, ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteUser, updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { doc, deleteDoc, collection, getDocs, query, where, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth } from '../../../utils/firebaseConfig.js';
import toast from 'react-hot-toast';

const storage = getStorage();

// A reusable card component for settings sections
const SettingsCard = ({ title, children }) => {
  return (
    <div className="rounded-lg shadow-md overflow-hidden mb-8 transition-colors duration-300 bg-zinc-900/80 border border-zinc-700/50">
      <h2 className="text-lg font-semibold p-4 border-b border-zinc-700/50 text-white">{title}</h2>
      <div className="divide-y divide-zinc-700/50">
        {children}
      </div>
    </div>
  );
};

// Custom Delete Account Modal
const DeleteAccountModal = ({ isOpen, onClose, user }) => {
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (emailConfirmation !== user?.email) {
      setError('Email does not match your account email');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      // Delete user's chat sessions
      const chatSessionsRef = collection(db, 'users', user.uid, 'chatSessions');
      const chatSessions = await getDocs(chatSessionsRef);
      const deletePromises = chatSessions.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete user document
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete user's shared chats
      const sharedChatsRef = collection(db, 'sharedChats');
      const sharedChatsQuery = query(sharedChatsRef, where('userId', '==', user.uid));
      const sharedChats = await getDocs(sharedChatsQuery);
      const deleteSharedPromises = sharedChats.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteSharedPromises);

      // Finally delete the user account
      await deleteUser(user);

      toast.success('Account deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setEmailConfirmation('');
    setError('');
    setIsDeleting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetForm();
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="rounded-xl shadow-2xl max-w-md w-full p-6 transition-colors duration-300 bg-zinc-900 border border-zinc-700"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-900/20">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete Account</h3>
                  <p className="text-sm text-slate-400">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="text-slate-400 hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Warning */}
            <div className="rounded-lg p-4 mb-6 bg-red-900/20 border border-red-800">
              <h4 className="font-medium mb-2 text-red-200">⚠️ This will permanently delete:</h4>
              <ul className="text-sm space-y-1 text-red-300">
                <li>• Your account and profile</li>
                <li>• All chat conversations</li>
                <li>• Shared chat links</li>
                <li>• Subscription and billing data</li>
                <li>• All other associated data</li>
              </ul>
            </div>

            {/* Email Confirmation */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-slate-300">
                To confirm deletion, type your email address: <span className="font-mono text-white">{user?.email}</span>
              </label>
              <input
                type="email"
                value={emailConfirmation}
                onChange={(e) => {
                  setEmailConfirmation(e.target.value);
                  setError('');
                }}
                placeholder="Enter your email address"
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white placeholder-slate-400 focus:ring-red-500 focus:border-red-500"
                disabled={isDeleting}
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-slate-300 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || emailConfirmation !== user?.email}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Clear Chat History Modal
const ClearChatModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = async () => {
    if (!user) return;

    setIsClearing(true);
    try {
      // Get all chat sessions
      const chatSessionsRef = collection(db, 'users', user.uid, 'chatSessions');
      const chatSessions = await getDocs(chatSessionsRef);

      // Delete all chat sessions and their messages
      const batch = writeBatch(db);
      for (const sessionDoc of chatSessions.docs) {
        // Delete messages in each session
        const messagesRef = collection(db, 'users', user.uid, 'chatSessions', sessionDoc.id, 'messages');
        const messages = await getDocs(messagesRef);
        messages.docs.forEach(msgDoc => batch.delete(msgDoc.ref));
        // Delete the session itself
        batch.delete(sessionDoc.ref);
      }
      await batch.commit();

      toast.success('All chat history cleared successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast.error('Failed to clear chat history');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="rounded-xl shadow-2xl max-w-md w-full p-6 bg-zinc-900 border border-zinc-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-900/20">
                <MessageSquare className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Clear Chat History</h3>
                <p className="text-sm text-slate-400">This will delete all conversations</p>
              </div>
            </div>

            <p className="text-slate-300 mb-6">
              Are you sure you want to delete all your chat history? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isClearing}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-slate-300 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                disabled={isClearing}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isClearing ? <><Loader2 className="w-4 h-4 animate-spin" /> Clearing...</> : 'Clear All'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Password Reset Modal
const PasswordResetModal = ({ isOpen, onClose, user }) => {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendReset = async () => {
    if (!user?.email) return;

    setIsSending(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSent(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="rounded-xl shadow-2xl max-w-md w-full p-6 bg-zinc-900 border border-zinc-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-900/20">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Change Password</h3>
                <p className="text-sm text-slate-400">We'll send you a reset link</p>
              </div>
            </div>

            {sent ? (
              <div className="text-center py-4">
                <Check className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-300 mb-2">Reset email sent to:</p>
                <p className="text-white font-medium">{user?.email}</p>
                <p className="text-sm text-slate-400 mt-2">Check your inbox and follow the link to reset your password.</p>
              </div>
            ) : (
              <p className="text-slate-300 mb-6">
                We'll send a password reset link to <span className="text-white font-medium">{user?.email}</span>
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-slate-300 bg-zinc-700 hover:bg-zinc-600"
              >
                {sent ? 'Done' : 'Cancel'}
              </button>
              {!sent && (
                <button
                  onClick={handleSendReset}
                  disabled={isSending}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Edit Profile Modal with Image Upload
const EditProfileModal = ({ isOpen, onClose, user, userProfile, onUpdate }) => {
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userProfile?.displayName) {
      setDisplayName(userProfile.displayName);
    }
    // Set preview image - prioritize custom photo, fall back to Google photo
    if (userProfile?.photoURL) {
      setPreviewImage(userProfile.photoURL);
    } else if (user?.photoURL) {
      setPreviewImage(user.photoURL);
    }
  }, [userProfile, user]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!selectedFile || !user) return null;

    const timestamp = Date.now();
    const fileExtension = selectedFile.name.split('.').pop();
    const fileName = `profile_${timestamp}.${fileExtension}`;
    const storageRef = ref(storage, `users/${user.uid}/profile/${fileName}`);

    // Delete old profile image if exists
    if (userProfile?.photoURL && userProfile.photoURL.includes('firebase')) {
      try {
        const oldRef = ref(storage, userProfile.photoURL);
        await deleteObject(oldRef).catch(() => { }); // Ignore error if file doesn't exist
      } catch (e) {
        console.log('Could not delete old image:', e);
      }
    }

    await uploadBytes(storageRef, selectedFile);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      let photoURL = userProfile?.photoURL || null;

      // Upload new image if selected
      if (selectedFile) {
        setIsUploadingImage(true);
        photoURL = await uploadImage();
        setIsUploadingImage(false);
      }

      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        photoURL: photoURL,
        updatedAt: serverTimestamp()
      });

      toast.success('Profile updated successfully');
      setSelectedFile(null);
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
      setIsUploadingImage(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewImage(userProfile?.photoURL || null);
    onClose();
  };

  const getInitials = () => {
    const name = displayName || userProfile?.displayName || user?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="rounded-xl shadow-2xl max-w-md w-full p-6 bg-zinc-900 border border-zinc-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-900/20">
                <Edit2 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Edit Profile</h3>
                <p className="text-sm text-slate-400">Update your profile picture and name</p>
              </div>
            </div>

            {/* Profile Image Upload */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group"
                  disabled={isSaving}
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-zinc-700 group-hover:border-emerald-500 transition-colors"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-zinc-700 group-hover:border-emerald-500 transition-colors">
                      {getInitials()}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  {isUploadingImage && (
                    <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </button>
                {selectedFile && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
            <p className="text-center text-sm text-slate-400 mb-6">Click to upload a new photo</p>

            {/* Display Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-slate-300">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isSaving}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-slate-300 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !displayName.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
    />
    <div className={`w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
  </label>
);

// A reusable settings row component
const SettingsRow = ({ icon, title, description, control }) => {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <div className="text-slate-400">{icon}</div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <div>{control}</div>
    </div>
  );
};

export default function SettingsPage() {
  const { currentUser: user, role, userProfile, refreshUserProfile } = useAuth();
  const navigate = useNavigate();

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Settings states
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Settings values (from userProfile)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [dataRetention, setDataRetention] = useState(true);

  // Load settings from userProfile
  useEffect(() => {
    if (userProfile?.settings) {
      setEmailNotifications(userProfile.settings.notifications ?? true);
      setMarketingEmails(userProfile.settings.emailUpdates ?? false);
      setDataRetention(userProfile.settings.dataRetention ?? true);
    }
  }, [userProfile]);

  // Refresh user profile on component mount
  useEffect(() => {
    const refreshProfile = async () => {
      setIsRefreshingProfile(true);
      try {
        await refreshUserProfile();
      } catch (error) {
        console.error('Error refreshing user profile:', error);
      } finally {
        setIsRefreshingProfile(false);
      }
    };

    refreshProfile();
  }, [refreshUserProfile]);

  // Save setting to Firebase
  const saveSetting = useCallback(async (settingName, value) => {
    if (!user) return;

    setIsSavingSettings(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [`settings.${settingName}`]: value,
        updatedAt: serverTimestamp()
      });
      toast.success('Setting saved');
    } catch (error) {
      console.error('Error saving setting:', error);
      toast.error('Failed to save setting');
    } finally {
      setIsSavingSettings(false);
    }
  }, [user]);

  // Handle toggle changes
  const handleEmailNotificationsChange = (value) => {
    setEmailNotifications(value);
    saveSetting('notifications', value);
  };

  const handleMarketingEmailsChange = (value) => {
    setMarketingEmails(value);
    saveSetting('emailUpdates', value);
  };

  const handleDataRetentionChange = (value) => {
    setDataRetention(value);
    saveSetting('dataRetention', value);
  };

  // Export user data
  const handleExportData = async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      // Gather user data
      const userData = {
        profile: userProfile,
        email: user.email,
        exportedAt: new Date().toISOString()
      };

      // Get chat sessions
      const chatSessionsRef = collection(db, 'users', user.uid, 'chatSessions');
      const chatSessions = await getDocs(chatSessionsRef);
      userData.chatSessions = [];

      for (const sessionDoc of chatSessions.docs) {
        const sessionData = sessionDoc.data();
        const messagesRef = collection(db, 'users', user.uid, 'chatSessions', sessionDoc.id, 'messages');
        const messages = await getDocs(messagesRef);
        userData.chatSessions.push({
          id: sessionDoc.id,
          ...sessionData,
          messages: messages.docs.map(m => ({ id: m.id, ...m.data() }))
        });
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relyce-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-black transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-300 bg-zinc-800 hover:bg-zinc-700"
          >
            ← Back
          </button>
        </div>

        <SettingsCard title="Profile">
          {/* Profile Picture Row */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {(userProfile?.photoURL || user?.photoURL) ? (
                <img
                  src={userProfile?.photoURL || user?.photoURL}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-zinc-600"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold">
                  {(userProfile?.displayName || user?.displayName || user?.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-white">Profile Picture</h3>
                <p className="text-sm text-slate-400">Click edit to change your photo</p>
              </div>
            </div>
            <button
              onClick={() => setShowEditProfileModal(true)}
              className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-600 hover:bg-slate-700 text-slate-200 flex items-center gap-2"
            >
              <Camera size={14} /> Change
            </button>
          </div>
          <SettingsRow
            icon={<User size={20} />}
            title="Display Name"
            description={userProfile?.displayName || user?.displayName || 'Not set'}
            control={
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-600 hover:bg-slate-700 text-slate-200 flex items-center gap-2"
              >
                <Edit2 size={14} /> Edit
              </button>
            }
          />
          <SettingsRow
            icon={<Hash size={20} />}
            title="User ID"
            description={
              isRefreshingProfile && !userProfile?.uniqueUserId
                ? "Loading..."
                : (userProfile?.uniqueUserId || "Assigning ID...")
            }
            control={
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-500">Unique Identifier</span>
                {isRefreshingProfile && !userProfile?.uniqueUserId && (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                )}
              </div>
            }
          />
          <SettingsRow
            icon={<User size={20} />}
            title="Email"
            description={user?.email || "Not logged in"}
            control={<span className="text-sm text-slate-500">Cannot be changed</span>}
          />
          <SettingsRow
            icon={<Lock size={20} />}
            title="Password"
            description="Change your account password."
            control={
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-600 hover:bg-slate-700 text-slate-200"
              >
                Change
              </button>
            }
          />
        </SettingsCard>

        <SettingsCard title="Subscription">
          <SettingsRow
            icon={<CreditCard size={20} />}
            title="Current Plan"
            description={`You are currently on the ${userProfile?.membership?.planName || role || 'Free'} plan.`}
            control={
              <Link to="/membership" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-500">
                Manage Plan <ExternalLink size={14} />
              </Link>
            }
          />
          <SettingsRow
            icon={<Globe size={20} />}
            title="Billing Cycle"
            description={userProfile?.membership?.billingCycle === 'yearly' ? 'Yearly billing' : 'Monthly billing'}
            control={<span className="text-sm text-slate-500">Manage in billing portal</span>}
          />
        </SettingsCard>

        <SettingsCard title="Notifications">
          <SettingsRow
            icon={<Bell size={20} />}
            title="Email Notifications"
            description="Receive updates about your account via email."
            control={
              <ToggleSwitch
                checked={emailNotifications}
                onChange={handleEmailNotificationsChange}
                disabled={isSavingSettings}
              />
            }
          />
          <SettingsRow
            icon={<Globe size={20} />}
            title="Marketing Communications"
            description="Receive news and product updates."
            control={
              <ToggleSwitch
                checked={marketingEmails}
                onChange={handleMarketingEmailsChange}
                disabled={isSavingSettings}
              />
            }
          />
        </SettingsCard>

        <SettingsCard title="Privacy & Security">
          <SettingsRow
            icon={<Shield size={20} />}
            title="Data Retention"
            description="Keep your chat history and uploaded files."
            control={
              <ToggleSwitch
                checked={dataRetention}
                onChange={handleDataRetentionChange}
                disabled={isSavingSettings}
              />
            }
          />
        </SettingsCard>

        <SettingsCard title="Data & Storage">
          <SettingsRow
            icon={<Download size={20} />}
            title="Export Data"
            description="Download all your chat history and account data."
            control={
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-600 hover:bg-slate-700 text-slate-200 flex items-center gap-2 disabled:opacity-50"
              >
                {isExporting ? <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</> : 'Export'}
              </button>
            }
          />
          <SettingsRow
            icon={<LinkIcon size={20} />}
            title="My Files"
            description="View and manage your uploaded files."
            control={
              <Link to="/files" className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-600 hover:bg-slate-700 text-slate-200">
                View Files
              </Link>
            }
          />
          <SettingsRow
            icon={<Trash2 size={20} />}
            title="Clear Chat History"
            description="Delete all your chat conversations."
            control={
              <button
                onClick={() => setShowClearChatModal(true)}
                className="px-4 py-2 text-sm font-semibold rounded-md border border-orange-600 hover:bg-orange-900/20 text-orange-400"
              >
                Clear
              </button>
            }
          />
        </SettingsCard>

        <div className="bg-transparent border rounded-lg shadow-md overflow-hidden border-red-500/30">
          <h2 className="text-lg font-semibold p-4 border-b border-red-500/30 text-red-400">Danger Zone</h2>
          <SettingsRow
            icon={<Trash2 size={20} className="text-red-400" />}
            title="Delete Account"
            description="Permanently delete your account and all data."
            control={
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-500"
              >
                Delete
              </button>
            }
          />
        </div>

        {/* Modals */}
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          user={user}
        />
        <ClearChatModal
          isOpen={showClearChatModal}
          onClose={() => setShowClearChatModal(false)}
          user={user}
          onSuccess={() => navigate('/chat')}
        />
        <PasswordResetModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          user={user}
        />
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          user={user}
          userProfile={userProfile}
          onUpdate={refreshUserProfile}
        />
      </div>
    </div>
  );
}