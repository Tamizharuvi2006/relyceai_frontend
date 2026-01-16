import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { wsManager } from '../utils/api';

class ChatService {
  static async addMessage(userId, sessionId, role, content, files = []) {
    const processedFiles = files.map(({ file, ...metadata }) => metadata);

    if (!sessionId || !userId) return Date.now().toString();

    try {
      const messagesRef = collection(db, 'users', userId, 'chatSessions', sessionId, 'messages');
      const docRef = await addDoc(messagesRef, {
        role,
        content,
        files: processedFiles,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch {
      return Date.now().toString();
    }
  }

  static subscribeToMessages(userId, sessionId, callback) {
    if (!userId || !sessionId) {
      callback([]);
      return () => {};
    }

    const messagesRef = collection(db, 'users', userId, 'chatSessions', sessionId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, () => callback([]));
  }

  static async updateSessionName(userId, sessionId, newName) {
    if (sessionId && userId) {
      const sessionRef = doc(db, 'users', userId, 'chatSessions', sessionId);
      await updateDoc(sessionRef, { name: newName });
    }
  }

  static async getUserUniqueId(userId) {
    try {
      if (userId) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) return userDoc.data().uniqueUserId || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  static sendMessage(message, sessionId, chatMode = 'standard', isWebSearch = false) {
    return wsManager.isConnected() ? wsManager.sendMessage(message, sessionId, chatMode, isWebSearch) : { success: false };
  }

  static sendStopSignal() {
    return wsManager.isConnected() ? wsManager.sendStopSignal() : false;
  }

  static async reconnect() {
    return await wsManager.reconnect();
  }

  static isConnected() {
    return wsManager.isConnected();
  }

  static setUserId(userId) {
    wsManager.setUserId(userId);
  }

  static setCurrentSessionId(sessionId) {
    wsManager.setCurrentSessionId(sessionId);
  }
}

export default ChatService;