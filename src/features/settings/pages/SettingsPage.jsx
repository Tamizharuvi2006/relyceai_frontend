import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { User, Lock, Trash2, CreditCard, ExternalLink, Bell, Shield, Globe, Download, AlertTriangle, X, Hash, Link as LinkIcon, Save, Loader2, Check, Edit2, MessageSquare, Camera, ImageIcon, Cpu, BrainCircuit, ChevronRight, Copy, Plus, Brain } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteUser, updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { doc, deleteDoc, collection, getDocs, query, where, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, getStorage } from 'firebase/storage';
import { db, auth, storage } from '../../../utils/firebaseConfig.js';
import toast from 'react-hot-toast';

// A reusable card component for settings sections
const SettingsCard = ({ title, children }) => {
  return (
    <div className="rounded-[2px] shadow-sm overflow-hidden mb-8 transition-colors duration-300 bg-[#030508] border border-white/5">
      <h2 className="text-base font-light tracking-wide px-6 py-4 border-b border-white/5 text-zinc-100 flex items-center gap-2">
        {title}
      </h2>
      <div className="divide-y divide-white/5">
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
      const storage = getStorage();
      
      const filesRef = collection(db, 'users', user.uid, 'files');
      const filesSnapshot = await getDocs(filesRef);
      
      const deleteFilePromises = filesSnapshot.docs.map(async (fileDoc) => {
        const fileData = fileDoc.data();
        if (fileData.storagePath) {
          try {
            const fileRef = ref(storage, fileData.storagePath);
            await deleteObject(fileRef);
          } catch (e) {
            console.log('Could not delete file from storage:', e);
          }
        }
      });
      await Promise.all(deleteFilePromises);

      const personalitiesRef = collection(db, 'users', user.uid, 'personalities');
      const personalitiesSnapshot = await getDocs(personalitiesRef);
      const deletePersonalitiesPromises = personalitiesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePersonalitiesPromises);

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
            className="rounded-[2px] shadow-2xl max-w-md w-full p-6 transition-colors duration-300 bg-[#030508] border border-white/5"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[2px] flex items-center justify-center bg-red-900/10 border border-red-500/20">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-light tracking-wide text-white">Delete Account</h3>
                  <p className="text-sm font-light text-zinc-500">This action cannot be undone</p>
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
            className="rounded-[2px] shadow-2xl max-w-md w-full p-6 bg-[#030508] border border-white/5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-[2px] flex items-center justify-center bg-orange-900/10 border border-orange-500/20">
                <MessageSquare className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-light tracking-wide text-white">Clear Chat History</h3>
                <p className="text-sm font-light text-zinc-500">This will delete all conversations</p>
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
            className="rounded-[2px] shadow-2xl max-w-md w-full p-6 bg-[#030508] border border-white/5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-[2px] flex items-center justify-center bg-emerald-900/10 border border-emerald-500/20">
                <Lock className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-light tracking-wide text-white">Change Password</h3>
                <p className="text-sm font-light text-zinc-500">We'll send you a reset link</p>
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
            className="rounded-[2px] shadow-2xl max-w-md w-full p-6 bg-[#030508] border border-white/5"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-[2px] flex items-center justify-center bg-blue-900/10 border border-blue-500/20">
                <Edit2 className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-light tracking-wide text-white">Edit Profile</h3>
                <p className="text-sm font-light text-zinc-500">Update your profile picture and name</p>
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
    <div className="flex items-center justify-between p-4 sm:px-6 hover:bg-white/[0.02] transition-colors duration-200 group">
      <div className="flex items-center gap-4">
        <div className="text-zinc-500 p-2 rounded-[2px] bg-white/[0.02] border border-white/5 group-hover:border-white/10 transition-colors">{icon}</div>
        <div>
          <h3 className="text-sm font-light tracking-wide text-zinc-200">{title}</h3>
          <div className="text-xs font-light tracking-wide text-zinc-500 mt-0.5">{description}</div>
        </div>
      </div>
      <div>{control}</div>
    </div>
  );
};

// Memory Importer Component
const EXPORT_PROMPT = `Export all of my stored memories and any context you've learned about me from past conversations. Preserve my words verbatim where possible, especially for instructions and preferences.

## Categories (output in this order):

1. **Instructions**: Rules I've explicitly asked you to follow going forward — tone, format, style, "always do X", "never do Y", and corrections to your behavior. Only include rules from stored memories, not from conversations.

2. **Identity**: Name, age, location, education, family, relationships, languages, and personal interests.

3. **Career**: Current and past roles, companies, and general skill areas.

4. **Projects**: Projects I meaningfully built or committed to. Ideally ONE entry per project. Include what it does, current status, and any key decisions. Use the project name or a short descriptor as the first words of the entry.

5. **Preferences**: Opinions, tastes, and working-style preferences that apply broadly.

## Format:

Use section headers for each category. Within each category, list one entry per line, sorted by oldest date first. Format each line as:

[YYYY-MM-DD] - Entry content here.

If no date is known, use [unknown] instead.

## Output:
- Wrap the entire export in a single code block for easy copying.
- After the code block, state whether this is the complete set or if more remain.`;

const MemoryImporter = ({ userProfile, onImportDone }) => {
  const embedded = !!onImportDone; // if onImportDone provided, we're inside MemoryManager
  const [isOpen, setIsOpen] = useState(embedded); // always open in embedded mode
  const [memoryText, setMemoryText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const userId = userProfile?.uniqueUserId;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(EXPORT_PROMPT);
      setCopied(true);
      toast.success('Prompt copied! Paste it into your other AI.');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleImport = async () => {
    if (!memoryText.trim() || !userId) return;
    setIsImporting(true);
    setImportResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/api/memories/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, text: memoryText })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setImportResult(data);
        toast.success(`${data.imported} memories imported!`);
        setMemoryText('');
        if (onImportDone) onImportDone(data);
      } else {
        toast.error(data.message || 'Import failed');
      }
    } catch (e) {
      console.error(e);
      toast.error('Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setMemoryText('');
    setImportResult(null);
  };

  const renderImportContent = () => (
    <>
      {/* Step 1: Copy prompt */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-6 h-6 rounded-full bg-emerald-600/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">1</span>
          <span className="text-sm text-zinc-300">Copy this prompt into a chat with your other AI provider</span>
        </div>
        <div className="relative">
          <div className="bg-[#0d1017] border border-white/10 rounded-lg p-4 text-[13px] text-zinc-400 leading-relaxed max-h-[140px] overflow-y-auto pr-20">
            {EXPORT_PROMPT}
          </div>
          <button
            onClick={handleCopyPrompt}
            className="absolute top-3 right-3 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 rounded-md"
          >
            {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
          </button>
        </div>
      </div>

      {/* Step 2: Paste results */}
      <div className="mb-5">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-6 h-6 rounded-full bg-emerald-600/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">2</span>
          <span className="text-sm text-zinc-300">Paste results below to add to Relyce's memory</span>
        </div>
        <textarea
          value={memoryText}
          onChange={(e) => setMemoryText(e.target.value)}
          rows="7"
          className="bg-[#0d1017] border border-white/10 text-zinc-200 text-sm rounded-lg focus:ring-emerald-500/30 focus:border-emerald-500/50 block w-full p-4 placeholder-zinc-600 transition-colors resize-none"
          placeholder="Paste your memory details here"
          autoFocus
        />
      </div>

      {/* Import result */}
      {importResult && importResult.entries && (
        <div className="mb-5 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
          <p className="text-sm text-emerald-400 font-medium mb-2">{importResult.imported} memories imported:</p>
          <div className="space-y-1.5">
            {importResult.entries.slice(0, 8).map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-500/70 bg-emerald-500/10 px-1.5 py-0.5 rounded">{e.category}</span>
                <span className="text-zinc-300">{e.content}</span>
              </div>
            ))}
            {importResult.entries.length > 8 && (
              <p className="text-xs text-zinc-500">+{importResult.entries.length - 8} more</p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
        {!embedded && (
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-sm text-zinc-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-all"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleImport}
          disabled={!memoryText.trim() || isImporting}
          className="px-5 py-2.5 text-sm bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all flex items-center gap-2 font-medium"
        >
          {isImporting ? <><Loader2 size={14} className="animate-spin" /> Parsing...</> : 'Add to memory'}
        </button>
      </div>
    </>
  );

  if (!isOpen && !embedded) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 w-full border border-dashed border-white/10 hover:border-white/20 bg-transparent hover:bg-white/[0.02] text-zinc-500 hover:text-zinc-300 text-xs font-mono tracking-widest uppercase transition-all"
      >
        <Plus size={14} />
        <span>Import Memories from Other AI</span>
      </button>
    );
  }

  // Embedded mode: render content directly (no portal)
  if (embedded) {
    return renderImportContent();
  }

  // Standalone mode: render as portal modal
  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg mx-4 bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-zinc-100">Import memory to Relyce</h3>
          <button onClick={handleClose} className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>
        {renderImportContent()}
      </div>
    </div>,
    document.body
  );
};

// Full Memory Manager Component (themed to match About/Chat page)
const MemoryManager = ({ userId }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('summary');
  const [memories, setMemories] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

  const catStyle = {
    identity: 'text-blue-300/80 border-blue-400/20',
    profession: 'text-emerald-300/80 border-emerald-400/20',
    preference: 'text-purple-300/80 border-purple-400/20',
    project: 'text-amber-300/80 border-amber-400/20',
    context: 'text-zinc-400/80 border-zinc-500/20',
  };

  const fetchMemories = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API}/api/memories/${userId}`);
      const data = await res.json();
      setMemories(data.memories || []);
    } catch (e) { console.error(e); }
  }, [userId, API]);

  const fetchSummary = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/memories/summary/${userId}`);
      const data = await res.json();
      setSummary(data.summary || '');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [userId, API]);

  const handleOpen = () => {
    setIsOpen(true);
    setView('summary');
    fetchSummary();
    fetchMemories();
  };

  const handleDelete = async (memId) => {
    try {
      await fetch(`${API}/api/memories/${userId}/${memId}`, { method: 'DELETE' });
      setMemories(prev => prev.filter(m => m.id !== memId));
      toast.success('Memory removed');
    } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = async (memId) => {
    if (!editText.trim()) return;
    try {
      await fetch(`${API}/api/memories/${userId}/${memId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editText })
      });
      setMemories(prev => prev.map(m => m.id === memId ? { ...m, content: editText } : m));
      setEditingId(null);
      setEditText('');
      toast.success('Memory updated');
    } catch { toast.error('Failed to update'); }
  };

  const handleClearAll = async () => {
    if (!confirm('Delete all memories? This cannot be undone.')) return;
    try {
      await fetch(`${API}/api/memories/clear/${userId}`, { method: 'DELETE' });
      setMemories([]);
      setSummary('');
      toast.success('All memories cleared');
    } catch { toast.error('Failed to clear'); }
  };

  const handleSeeWhatLearned = () => {
    setIsOpen(false);
    navigate('/chat');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('relyce-start-chat', { 
        detail: { message: 'I updated my memory. What did you learn about me?' } 
      }));
    }, 600);
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-4 w-full py-4 text-left group"
      >
        <div className="w-9 h-9 rounded-full border border-emerald-500/20 flex items-center justify-center">
          <Brain size={16} className="text-emerald-500/70" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-light text-zinc-200 group-hover:text-white transition-colors">Manage memory</span>
          <p className="text-[10px] tracking-wider uppercase font-mono text-zinc-600 mt-0.5">View what Relyce remembers</p>
        </div>
        <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </button>
    );
  }

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      
      {/* Modal — About page theme */}
      <div className="relative w-full max-w-[560px] mx-4 bg-[#030508] border border-white/[0.06] rounded-none shadow-2xl shadow-black/80 max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Subtle top accent line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

        {/* Header */}
        <div className="px-8 pt-7 pb-4 flex items-start justify-between">
          <div>
            {(view === 'edits' || view === 'import') && (
              <button 
                onClick={() => setView(view === 'import' ? 'edits' : 'summary')} 
                className="flex items-center gap-2 text-[10px] font-mono tracking-[0.15em] uppercase text-zinc-500 hover:text-zinc-300 transition-colors mb-3"
              >
                <ChevronRight size={10} className="rotate-180" /> 
                {view === 'import' ? 'Back to edits' : 'Back to memory'}
              </button>
            )}
            <h3 className="text-xl font-light tracking-tight text-white">
              {view === 'summary' ? 'Manage memory' : view === 'edits' ? 'Manage edits' : 'Import memory'}
            </h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 -m-2 text-zinc-600 hover:text-white transition-colors duration-300"
          >
            <X size={16} />
          </button>
        </div>

        {/* Summary View */}
        {view === 'summary' && (
          <>
            <p className="px-8 text-xs font-light text-zinc-500 mb-5 leading-relaxed">
              Here's what Relyce remembers about you. This summary is generated from your stored memories.
            </p>
            
            <div className="px-8 flex-1 overflow-y-auto mb-5">
              <div className="border border-white/[0.04] bg-white/[0.01] p-6 min-h-[180px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-44 gap-4">
                    <Loader2 size={18} className="animate-spin text-zinc-600" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">Updating memory...</span>
                  </div>
                ) : (
                  <div className="text-[13px] font-light text-zinc-400 leading-[1.8] whitespace-pre-wrap">
                    {summary.split('**').map((part, i) => 
                      i % 2 === 1 
                        ? <strong key={i} className="text-zinc-200 font-medium">{part}</strong> 
                        : <span key={i}>{part}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-8 pb-7 space-y-3">
              <button
                onClick={() => { setView('edits'); fetchMemories(); }}
                className="flex items-center justify-between w-full py-3 border-t border-white/5 group"
              >
                <span className="text-sm font-light text-zinc-400 group-hover:text-zinc-200 transition-colors">Manage edits</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-zinc-600">{memories.length}</span>
                  <ChevronRight size={12} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </div>
              </button>
              
              <button
                onClick={handleSeeWhatLearned}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black font-medium text-sm tracking-wide hover:bg-zinc-200 transition-colors duration-300"
              >
                See what Relyce learned about you
              </button>
            </div>
          </>
        )}

        {/* Edits View */}
        {view === 'edits' && (
          <>
            <p className="px-8 text-xs font-light text-zinc-500 mb-4">
              You can edit or remove individual memories.
            </p>
            
            <div className="flex items-center justify-between px-8 mb-4">
              <button
                onClick={() => setView('import')}
                className="text-[10px] font-mono tracking-[0.15em] uppercase text-emerald-500/70 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              >
                <Plus size={10} /> Import
              </button>
              {memories.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[10px] font-mono tracking-[0.15em] uppercase text-zinc-600 hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={10} /> Clear all
                </button>
              )}
            </div>
            
            <div className="px-8 flex-1 overflow-y-auto mb-6">
              <div className="border border-white/[0.04] max-h-[400px] overflow-y-auto">
                {memories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Brain size={20} className="text-zinc-700" />
                    <p className="text-xs font-light text-zinc-600">No memories yet. Start chatting or import from another AI.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.03]">
                    {memories.map(mem => (
                      <div key={mem.id} className="flex items-start gap-3 px-4 py-3 group hover:bg-white/[0.015] transition-colors duration-300">
                        <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border shrink-0 mt-0.5 ${catStyle[mem.category] || catStyle.context}`}>
                          {mem.category}
                        </span>
                        {editingId === mem.id ? (
                          <div className="flex-1 flex gap-2">
                            <input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 bg-transparent border-b border-emerald-500/30 text-zinc-200 text-xs py-1 focus:outline-none focus:border-emerald-500/60 font-light"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(mem.id); if (e.key === 'Escape') setEditingId(null); }}
                            />
                            <button onClick={() => handleEdit(mem.id)} className="text-emerald-500/60 hover:text-emerald-400 p-1"><Check size={12} /></button>
                            <button onClick={() => setEditingId(null)} className="text-zinc-600 hover:text-zinc-400 p-1"><X size={12} /></button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-light text-zinc-400 flex-1 leading-relaxed">{mem.content}</span>
                            <button
                              onClick={() => { setEditingId(mem.id); setEditText(mem.content); }}
                              className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-emerald-400 transition-all p-1 shrink-0"
                            >
                              <Edit2 size={10} />
                            </button>
                            <button
                              onClick={() => handleDelete(mem.id)}
                              className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all p-1 shrink-0"
                            >
                              <X size={10} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Import View */}
        {view === 'import' && (
          <div className="px-8 pb-7">
            <MemoryImporter userProfile={{ uniqueUserId: userId }} onImportDone={() => { fetchMemories(); setView('edits'); }} />
          </div>
        )}
      </div>
    </div>,
    document.body
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

  // Personalization settings
  const [tone, setTone] = useState('Default');
  const [emoji, setEmoji] = useState('Default');
  const [nickname, setNickname] = useState('');
  const [occupation, setOccupation] = useState('');
  const [aboutMe, setAboutMe] = useState('');

  // Initialization status
  const isInitialized = useRef(false);

  // Load settings from userProfile
  useEffect(() => {
    if (userProfile?.settings && !isInitialized.current) {
      setEmailNotifications(userProfile.settings.notifications ?? true);
      setMarketingEmails(userProfile.settings.emailUpdates ?? false);
      setDataRetention(userProfile.settings.dataRetention ?? true);

      // Load personalization
      const p = userProfile.settings.personalization || {};
      setTone(p.tone || 'Default');
      setEmoji(p.emoji || 'Default');
      setNickname(p.nickname || '');
      setOccupation(p.occupation || '');
      setAboutMe(p.aboutMe || '');
      
      isInitialized.current = true;
    }
  }, [userProfile]);

  // Refresh user profile on component mount
  useEffect(() => {
    refreshUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Personalization handlers
  const handleToneChange = (value) => {
    setTone(value);
    saveSetting('personalization.tone', value);
  };

  const handleEmojiChange = (value) => {
    setEmoji(value);
    saveSetting('personalization.emoji', value);
  };

  const handlePersonalizationBlur = (field, value) => {
    saveSetting(`personalization.${field}`, value);
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

  const [activeTab, setActiveTab] = useState('General');

  // Tab Icons helper
  const getTabIcon = (tab) => {
    switch(tab) {
      case 'General': return <User size={18} />;
      case 'Personalization': return <MessageSquare size={18} />;
      case 'Subscription': return <CreditCard size={18} />;
      case 'Notifications': return <Bell size={18} />;
      case 'Data Controls': return <Save size={18} />;
      case 'Security': return <Shield size={18} />;
      default: return <User size={18} />;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-[#030508] relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-16">
          <h1 className="text-4xl font-light text-white tracking-tight">Settings</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-xs font-mono uppercase tracking-widest rounded-none text-zinc-400 bg-transparent border border-white/10 hover:bg-white/5 hover:text-white transition-all duration-300"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Sidebar Navigation */}
          <div className="md:col-span-3">
            <div className="sticky top-8 space-y-2">
              {['General', 'Personalization', 'Subscription', 'Notifications', 'Data Controls', 'Security'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-4 py-3 rounded-none flex items-center gap-3 transition-all duration-300 text-xs font-mono tracking-widest uppercase group border-b ${
                    activeTab === tab 
                      ? 'bg-transparent text-emerald-400 border-emerald-500/50' 
                      : 'border-transparent text-zinc-600 hover:text-zinc-300 hover:border-white/10'
                  }`}
                >
                  <span className={`transition-colors duration-300 ${activeTab === tab ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-zinc-300'}`}>
                    {getTabIcon(tab)}
                  </span>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="md:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'General' && (
                  <SettingsCard title="Profile">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        {(userProfile?.photoURL || user?.photoURL) ? (
                          <img
                            src={userProfile?.photoURL || user?.photoURL}
                            alt="Profile"
                            className="w-16 h-16 rounded-[2px] object-cover border border-white/10 shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-[2px] bg-emerald-900/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 text-2xl font-light shadow-sm">
                            {(userProfile?.displayName || user?.displayName || user?.email || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-zinc-100">Profile Picture</h3>
                          <p className="text-sm text-zinc-500">Click change to update your photo</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowEditProfileModal(true)}
                        className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest rounded-none border border-white/10 bg-transparent hover:bg-white/5 text-zinc-400 flex items-center gap-2 transition-colors"
                      >
                         Change
                      </button>
                    </div>
                    <SettingsRow
                      icon={<User size={18} />}
                      title="Display Name"
                      description={userProfile?.displayName || user?.displayName || 'Not set'}
                      control={
                        <button
                          onClick={() => setShowEditProfileModal(true)}
                          className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest rounded-none border border-white/10 bg-transparent hover:bg-white/5 text-zinc-400 flex items-center gap-2 transition-colors"
                        >
                           Edit
                        </button>
                      }
                    />
                    <SettingsRow
                      icon={<Shield size={18} className="text-emerald-500" />}
                      title="User ID"
                      description={
                         <div className="flex flex-col gap-1">
                            <span>{isRefreshingProfile && !userProfile?.uniqueUserId ? "Loading..." : (userProfile?.uniqueUserId || "Assigning ID...")}</span>
                            {/* Raw ID Reveal */}
                            <details className="group cursor-pointer">
                               <summary className="list-none flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-400 transition-colors select-none w-fit">
                                  <span>Show Internal UID</span>
                                  <ChevronRight size={10} className="group-open:rotate-90 transition-transform" />
                               </summary>
                               <div className="mt-1 flex items-center gap-2 p-1.5 bg-zinc-900/80 border border-zinc-800 rounded-md max-w-xs">
                                  <code className="text-[10px] font-mono text-zinc-400 break-all select-all">
                                    {user?.uid}
                                  </code>
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(user?.uid);
                                      toast.success("UID Copied");
                                    }}
                                    title="Copy raw UID"
                                    className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors"
                                  >
                                    <Copy size={10} />
                                  </button>
                               </div>
                            </details>
                         </div>
                      }
                      control={
                        <div className="flex items-center gap-2">
                           <Lock size={12} className="text-zinc-600" />
                           <span className="text-xs font-mono text-emerald-500/90 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-medium">
                             {userProfile?.uniqueUserId || "..."}
                           </span>
                        </div>
                      }
                    />
                    <SettingsRow
                      icon={<User size={18} />}
                      title="Email"
                      description={user?.email || "Not logged in"}
                      control={<span className="text-xs text-zinc-600">Cannot be changed</span>}
                    />
                  </SettingsCard>
                )}

                {activeTab === 'Personalization' && (
                  <SettingsCard title="Personalization">
                      <div className="p-4 border-b border-zinc-800/50">
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                 <BrainCircuit size={18} />
                              </div>
                              <div>
                                 <h3 className="font-medium text-zinc-100">AI Personalities</h3>
                                 <p className="text-sm text-zinc-500">Manage how Relyce thinks and behaves.</p>
                              </div>
                           </div>
                           <Link to="/personalities" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                             Manage Personalities <ExternalLink size={12} />
                           </Link>
                        </div>
                      </div>

                      <SettingsRow
                        icon={<MessageSquare size={18} />}
                        title="Base Style & Tone"
                        description="Set the style and tone of how Relyce responds to you."
                        control={
                          <select
                            value={tone}
                            onChange={(e) => handleToneChange(e.target.value)}
                            className="bg-[#0a0d14] border border-white/10 text-zinc-300 text-sm font-light rounded-[2px] focus:ring-emerald-500/20 focus:border-emerald-500/50 block w-40 p-2"
                          >
                            <option value="Default">Default</option>
                            <option value="Professional">Professional</option>
                            <option value="Friendly">Friendly</option>
                            <option value="Candid">Candid</option>
                            <option value="Quirky">Quirky</option>
                            <option value="Efficient">Efficient</option>
                            <option value="Nerdy">Nerdy</option>
                            <option value="Cynical">Cynical</option>
                          </select>
                        }
                      />
                      <SettingsRow
                        icon={<MessageSquare size={18} />}
                        title="Emoji Usage"
                        description="Adjust how much Relyce uses emojis."
                        control={
                          <select
                            value={emoji}
                            onChange={(e) => handleEmojiChange(e.target.value)}
                            className="bg-[#0a0d14] border border-white/10 text-zinc-300 text-sm font-light rounded-[2px] focus:ring-emerald-500/20 focus:border-emerald-500/50 block w-40 p-2"
                          >
                            <option value="Default">Default</option>
                            <option value="More">More</option>
                            <option value="Less">Less</option>
                          </select>
                        }
                      />
                      
                      <div className="px-6 pb-6 pt-4 border-t border-zinc-800/50 mt-2">
                         <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                            Memories
                         </h3>
                         <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                            Relyce learns from your conversations and imported memories to personalize your experience.
                         </p>
                         
                         {/* Claude-style Memory Manager */}
                         <MemoryManager userId={userProfile?.uniqueUserId} />
                      </div>
                  </SettingsCard>
                )}

                {activeTab === 'Subscription' && (
                  <>
                  <SettingsCard title="Subscription">
                    <SettingsRow
                      icon={<CreditCard size={18} />}
                      title="Current Plan"
                      description={`You are currently on the ${userProfile?.membership?.planName || role || 'Free'} plan.`}
                      control={
                        <Link to="/membership" className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
                          Manage Plan <ExternalLink size={12} />
                        </Link>
                      }
                    />
                    <SettingsRow
                      icon={<Globe size={18} />}
                      title="Billing Cycle"
                      description={userProfile?.membership?.billingCycle === 'yearly' ? 'Yearly billing' : 'Monthly billing'}
                      control={<span className="text-xs text-zinc-500">Manage in billing portal</span>}
                    />
                    
                    {userProfile?.membership?.status === 'active' && userProfile?.membership?.plan !== 'free' && (
                        <>
                            <SettingsRow
                                icon={<CreditCard size={18} />}
                                title="Membership Started"
                                description={userProfile?.membership?.startDate ? new Date(userProfile.membership.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : 'Unknown'}
                                control={<span className="text-xs text-zinc-500">Auto-renew active</span>}
                            />
                            <SettingsRow
                                icon={<CreditCard size={18} />}
                                title="Next Billing Date"
                                description={userProfile?.membership?.expiryDate ? new Date(userProfile.membership.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : 'Unknown'}
                                control={<span className="text-xs text-emerald-400 font-medium">Active</span>}
                            />
                        </>
                    )}
                    </SettingsCard>
                    
                     <div className="mt-4 p-4 rounded-lg bg-yellow-900/10 border border-yellow-900/30">
                        <div className="flex items-start gap-3">
                           <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                           <div>
                              <h4 className="text-sm font-semibold text-yellow-500 mb-1">Payment & Cancellation Policy</h4>
                              <p className="text-sm text-yellow-200/80 leading-relaxed">
                                 Please note that all one-time payments are <strong>non-refundable</strong>. 
                                 However, you can <span className="text-white hover:underline cursor-pointer">cancel your subscription</span> at any time to prevent future charges. 
                                 Your access will remain active until the end of your current billing period.
                              </p>
                           </div>
                        </div>
                     </div>
                  </>
                )}

                {activeTab === 'Notifications' && (
                  <SettingsCard title="Notifications">
                    <SettingsRow
                      icon={<Bell size={18} />}
                      title="Email Notifications"
                      description="Receive emails about your account activity."
                      control={
                        <ToggleSwitch
                          checked={emailNotifications}
                          onChange={handleEmailNotificationsChange}
                        />
                      }
                    />
                    <SettingsRow
                      icon={<Bell size={18} />}
                      title="Marketing Emails"
                      description="Receive updates about new features."
                      control={
                        <ToggleSwitch
                          checked={marketingEmails}
                          onChange={handleMarketingEmailsChange}
                        />
                      }
                    />
                  </SettingsCard>
                )}

                {activeTab === 'Data Controls' && (
                  <SettingsCard title="Data Controls">
                    <SettingsRow
                      icon={<Download size={18} />}
                      title="Export Data"
                      description="Download all your chat history and account data."
                      control={
                        <button
                          onClick={handleExportData}
                          disabled={isExporting}
                          className="px-4 py-2 text-xs font-semibold rounded-md border border-zinc-700 hover:bg-zinc-800 text-zinc-300 flex items-center gap-2 transition-colors"
                        >
                          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download size={14} />}
                          Export
                        </button>
                      }
                    />
                    <SettingsRow
                      icon={<Save size={18} />}
                      title="Chat History & Training"
                      description="Save chat history to your account."
                      control={
                        <ToggleSwitch
                          checked={dataRetention}
                          onChange={handleDataRetentionChange}
                        />
                      }
                    />
                    <SettingsRow
                      icon={<Trash2 size={18} className="text-red-400" />}
                      title="Clear All Chats"
                      description="Permanently delete all your chat history."
                      control={
                        <button
                          onClick={() => setShowClearChatModal(true)}
                          className="px-4 py-2 text-xs font-semibold rounded-md border border-red-900/30 bg-red-900/10 text-red-400 hover:bg-red-900/20 transition-colors"
                        >
                          Clear
                        </button>
                      }
                    />
                  </SettingsCard>
                )}

                {activeTab === 'Security' && (
                  <SettingsCard title="Security">
                    <SettingsRow
                      icon={<Lock size={18} />}
                      title="Password"
                      description="Change your account password."
                      control={
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className="px-4 py-2 text-xs font-semibold rounded-md border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors"
                        >
                          Change
                        </button>
                      }
                    />
                    <SettingsRow
                      icon={<AlertTriangle size={18} className="text-red-400" />}
                      title="Delete Account"
                      description="Permanently delete your account and all data."
                      control={
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-4 py-2 text-xs font-semibold rounded-md bg-red-600/90 text-white hover:bg-red-600 transition-colors"
                        >
                          Delete Account
                        </button>
                      }
                    />
                  </SettingsCard>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Modals - Outside Grid but inside Container */}
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          user={user}
        />

        <ClearChatModal
          isOpen={showClearChatModal}
          onClose={() => setShowClearChatModal(false)}
          user={user}
          onSuccess={() => {
            // Optional callback
          }}
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
