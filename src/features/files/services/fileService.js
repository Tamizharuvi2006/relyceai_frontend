import { doc, setDoc, addDoc, collection, serverTimestamp, deleteDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../utils/firebaseConfig';
import { updateUserUsage } from '../../users/services/userService';
import { MEMBERSHIP_PLANS } from '../../membership/services/membershipService';

export async function uploadUserFileToBackendOnly(userId, file) {
    const canUpload = await checkUploadLimits(userId, file.size);
    if (!canUpload.allowed && canUpload.reason !== 'User not found') {
        throw new Error(canUpload.reason);
    }

    const backendResponse = await sendFileToBackend(file, userId);
    if (!backendResponse || backendResponse.error) {
        throw new Error(backendResponse?.error || 'Backend upload failed');
    }

    try {
        await updateUserUsage(userId, { filesUploaded: 1, storageUsedMB: file.size / (1024 * 1024) });
    } catch { /* silent */ }

    let fileMetadata = null;
    if (backendResponse?.status === 'success') {
        try {
            fileMetadata = {
                fileName: file.name, originalName: file.name,
                backendPath: backendResponse.file_saved_to || null,
                fileSize: file.size,
                fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
                fileType: file.type,
                uploadedAt: new Date(),
                uploadDate: new Date().toISOString(),
                userId, backendOnly: true
            };
            const docRef = await addDoc(collection(db, 'users', userId, 'files'), fileMetadata);
            fileMetadata.id = docRef.id;
        } catch { /* silent */ }
    } else {
        throw new Error('Backend upload did not return success status');
    }

    return { fileName: file.name, fileSize: file.size, backendResponse, fileMetadata };
}

export async function sendFileToBackend(file, userId) {
    const formData = new FormData();
    formData.append('file', file);
    if (userId) formData.append('user_id', userId);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const headers = userId ? { 'x-user-id': userId } : {};

    try {
        const res = await fetch(`${API_BASE_URL}/upload/`, { method: 'POST', body: formData, headers });
        if (!res.ok) throw new Error(`Backend upload failed: ${res.status}`);
        return await res.json();
    } catch (error) {
        return { error: 'Backend upload failed: ' + error.message };
    }
}

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
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return { allowed: true, unlimited: false, defaultLimits: true };

        const userData = userDoc.data();
        const userRole = userData.role || 'user';
        if (userRole === 'admin' || userRole === 'superadmin') return { allowed: true, unlimited: true };

        const planDetails = MEMBERSHIP_PLANS[userData.membership.plan.toUpperCase()];
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
