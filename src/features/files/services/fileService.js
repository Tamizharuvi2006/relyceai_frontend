import { doc, setDoc, addDoc, collection, serverTimestamp, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../utils/firebaseConfig';
// import { updateUserUsage } from '../../users/services/userService'; // REMOVED: Backend handles usage
import { MEMBERSHIP_PLANS } from '../../membership/services/membershipService';
import { uploadFile, fetchUserProfile } from '../../../utils/api';

/**
 * Upload file to FastAPI backend for RAG processing
 * IMPLEMENT: Connect to your FastAPI /upload endpoint
 */
export async function uploadChatFileToBackend(firebaseUid, uniqueUserId, sessionId, file, onProgress = null) {
    if (onProgress) onProgress(0);
    
    try {
        const result = await uploadFile(file);
        
        if (onProgress) onProgress(100);
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        /* 
           USAGE UPDATE: 
           Removed frontend usage update. 
           Backend /upload endpoint handles this securely.
        */
        // try {
        //     await updateUserUsage(firebaseUid, { ... });
        // } catch { /* silent */ }
        
        return {
            success: true,
            fileId: result.file_id,
            fileName: result.filename || file.name,
            chunksCreated: result.chunks_created,
            userId: result.user_id
        };
        
    } catch (error) {
        console.error('❌ Upload error:', error);
        throw error;
    }
}

// Legacy function - redirects to backend upload
export async function uploadChatFileToFirebase(firebaseUid, uniqueUserId, sessionId, file, onProgress = null) {
    return uploadChatFileToBackend(firebaseUid, uniqueUserId, sessionId, file, onProgress);
}

/**
 * Upload file to backend only (no Firebase)
 */
export async function uploadUserFileToBackendOnly(userId, file) {
    const canUpload = await checkUploadLimits(userId, file.size);
    if (!canUpload.allowed && canUpload.reason !== 'User not found') {
        throw new Error(canUpload.reason);
    }

    const result = await uploadFile(file);
    if (result.error) {
        throw new Error(result.error);
    }

    /* 
       USAGE UPDATE: 
       Removed frontend usage update. 
       Backend /upload endpoint handles this securely.
    */
    // try {
    //     await updateUserUsage(userId, { ... });
    // } catch { /* silent */ }

    // Save metadata to Firestore
    let fileMetadata = null;
    try {
        fileMetadata = {
            fileName: file.name, 
            originalName: file.name,
            backendPath: result.file_path || null,
            fileSize: file.size,
            fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
            fileType: file.type,
            uploadedAt: new Date(),
            uploadDate: new Date().toISOString(),
            userId, 
            backendOnly: true
        };
        const docRef = await addDoc(collection(db, 'users', userId, 'files'), fileMetadata);
        fileMetadata.id = docRef.id;
    } catch { /* silent */ }

    return { fileName: file.name, fileSize: file.size, backendResponse: result, fileMetadata };
}

// --- Firebase-only functions (kept intact) ---

export async function createUserFolderStructure(userId, userName) {
    const userFolderData = { userId, userName, createdAt: serverTimestamp(), totalFiles: 0, totalSizeMB: 0 };
    const folders = ['documents', 'images', 'conversations', 'shared'];
    for (const folderName of folders) {
        await setDoc(doc(db, 'users', userId, 'folders', folderName), {
            ...userFolderData, folderName, description: getFolderDescription(folderName)
        });
    }
}

export async function checkUploadLimits(userId, fileSize) {
    try {
        const payload = await fetchUserProfile();
        const userData = payload?.user;
        if (!userData) return { allowed: true, unlimited: false, defaultLimits: true };
        const userRole = userData.role;
        if (!userRole) return { allowed: false, reason: 'User role unavailable' };

        const normalizedRole = userRole === 'super_admin' ? 'superadmin' : userRole;
        if (normalizedRole === 'admin' || normalizedRole === 'superadmin') return { allowed: true, unlimited: true };

        const planId = userData.membership?.plan?.toUpperCase();
        if (!planId || !MEMBERSHIP_PLANS[planId]) {
            return { allowed: false, reason: 'Membership plan not configured' };
        }
        const planDetails = MEMBERSHIP_PLANS[planId];
        const fileSizeMB = fileSize / (1024 * 1024);

        if (fileSizeMB > planDetails.features.fileSizeLimitMB) {
            return { allowed: false, reason: `File size exceeds ${planDetails.features.fileSizeLimitMB}MB limit` };
        }

        if (planDetails.features.fileUploadLimit !== -1 && userData.usage.totalFilesUploaded >= planDetails.features.fileUploadLimit) {
            return { allowed: false, reason: `File upload limit reached (${planDetails.features.fileUploadLimit} files)` };
        }

        return { allowed: true };
    } catch { return { allowed: false, reason: 'Error checking limits' }; }
}

export async function getUserFiles(userId, folderType = null) {
    try {
        let q = collection(db, 'users', userId, 'files');
        if (folderType) q = query(q, where('folderType', '==', folderType));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch { return []; }
}

export async function deleteFileMetadata(userId, fileId) {
    try {
        await deleteDoc(doc(db, 'users', userId, 'files', fileId));
        return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
}

export function getFolderDescription(folderName) {
    const descriptions = {
        documents: 'PDFs, Word documents, spreadsheets, and other text files',
        images: 'Images, screenshots, and visual content',
        conversations: 'Chat history and conversation exports',
        shared: 'Files shared with other users'
    };
    return descriptions[folderName] || 'User files';
}
