// src/utils/api.js


// BACKEND CONFIGURATION - Uses environment variables with fallback

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

// Ensure WebSocket URL uses the correct path
const WS_URL = `${WS_BASE_URL}/ws/chat`;

// Debug logging disabled (token auth makes User ID log misleading)
const DEBUG = false;

/**
 * WebSocket connection manager for real-time chat
 * SECURITY: Uses Firebase ID token for authentication (not raw userId)
 */
class WebSocketManager {
  constructor() {
    this.ws = null;
    this.connecting = false;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectInterval = 1000;
    this.messageHandlers = new Set();
    this.connectionHandlers = new Set();
    this.sendQueue = [];
    this.pingTimer = null;
    this.userId = null;  // Set after token verification (for local reference only)
    this.authToken = null;  // Firebase ID token - sent to backend for verification
    this.currentSessionId = null;
    this.lastReceivedMessageId = null;

    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      this.currentSessionId = localStorage.getItem('chatSessionId');
      this.lastReceivedMessageId = localStorage.getItem('lastReceivedMessageId');

      window.addEventListener('beforeunload', () => {
        this.shouldReconnect = false;
        try { this.ws && this.ws.close(); } catch { /* noop */ }
      });
    }
  }

  // Set Firebase ID token for authentication
  setAuthToken(token) {
    this.authToken = token;
  }

  // Set userId (for local reference after token verification)
  setUserId(userId) {
    this.userId = userId;
  }

  setCurrentSessionId(sessionId) {
    this.currentSessionId = sessionId;
    // Store session ID in localStorage for persistence
    if (typeof window !== 'undefined' && sessionId) {
      localStorage.setItem('chatSessionId', sessionId);
    }
  }

  // Get or create a persistent session ID
  getOrCreateSessionId() {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('chatSessionId');
      if (!sessionId) {
        sessionId = this.generateSessionId();
        localStorage.setItem('chatSessionId', sessionId);
      }
      return sessionId;
    }
    return this.currentSessionId || this.generateSessionId();
  }

  // Get last received message ID from localStorage
  getLastReceivedMessageId() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastReceivedMessageId');
    }
    return this.lastReceivedMessageId;
  }

  // Generate a new session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          if (DEBUG) console.log('WebSocket already connected');
          resolve();
          return;
        }
        if (this.connecting) {
          if (DEBUG) console.log('WebSocket connection in progress');
          resolve();
          return;
        }
        this.connecting = true;

        // Ensure we have a session ID
        if (!this.currentSessionId) {
          this.currentSessionId = this.getOrCreateSessionId();
        }

        // Get last received message ID for reconnection
        if (!this.lastReceivedMessageId) {
          this.lastReceivedMessageId = this.getLastReceivedMessageId();
        }

        // Try multiple connection URLs
        // Only use the correct WebSocket URL
        const connectionUrls = [
          `${WS_URL}`
        ];

        // SECURITY: Send token instead of userId
        // Backend will verify token and extract real UID
        const params = [];
        if (this.authToken) params.push(`token=${encodeURIComponent(this.authToken)}`);
        if (this.currentSessionId) params.push(`sessionId=${this.currentSessionId}`);
        if (this.lastReceivedMessageId) params.push(`lastMsgId=${this.lastReceivedMessageId}`);

        // Try each URL in sequence
        this.tryConnectionUrls(connectionUrls, params, 0, resolve, reject);
      } catch (error) {
        console.error('WebSocket connection exception:', error);
        this.connectionHandlers.forEach(handler => handler('error'));
        this.connecting = false;
        reject(error);
      }
    });
  }

  tryConnectionUrls(urls, params, index, resolve, reject) {
    if (index >= urls.length) {
      console.error('All WebSocket connection attempts failed');
      this.connecting = false;
      reject(new Error('All connection attempts failed'));
      return;
    }

    const wsUrl = urls[index] + (params.length > 0 ? '?' + params.join('&') : '');
    if (DEBUG) console.log(`Attempting WebSocket connection to: ${wsUrl}`);

    // Try this URL
    this.ws = new WebSocket(wsUrl);

    // Add connection timeout (longer for Render cold starts)
    const connectionTimeout = setTimeout(() => {
      console.error(`WebSocket connection timeout for ${wsUrl}`);
      // Try next URL
      this.tryConnectionUrls(urls, params, index + 1, resolve, reject);
    }, 15000); // 15 second timeout for cold starts

    this.setupWebSocketHandlers(connectionTimeout, resolve, reject, () => {
      // If this connection fails, try the next one
      this.tryConnectionUrls(urls, params, index + 1, resolve, reject);
    });
  }


  setupWebSocketHandlers(timeout, resolve, reject, onConnectionError) {
    this.ws.onopen = () => {
      clearTimeout(timeout);
      if (DEBUG) {
        console.log('🟢 WebSocket connected to backend');
        console.log(`🔗 Connection details - User ID: ${this.userId}, Session ID: ${this.currentSessionId}`);
      }
      this.reconnectAttempts = 0;
      this.connecting = false;
      this.connectionHandlers.forEach(handler => handler('connected'));
      // Flush any queued messages
      while (this.sendQueue.length && this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          if (DEBUG) console.log('📤 Sending queued message:', this.sendQueue[0]);
          this.ws.send(JSON.stringify(this.sendQueue.shift()));
        } catch (error) {
          console.error('❌ Error sending queued message:', error); // Debug: Log send error
          break;
        }
      }
      // Start keepalive ping
      this.startKeepAlive();
      resolve();
    };

    this.ws.onmessage = (event) => {
      if (DEBUG) console.log('📥 Message received from backend:', event.data);
      let payload = null;
      try {
        payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        // Fallback: raw string message
        payload = { type: 'bot', text: String(event.data) };
      }

      // Handle message acknowledgment
      if (payload && payload.messageId) {
        this.lastReceivedMessageId = payload.messageId;
        // Store last received message ID in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('lastReceivedMessageId', payload.messageId);
        }
      }

      // Ignore pong messages
      if (payload && (payload.type === 'pong' || payload === 'pong')) return;
      this.messageHandlers.forEach(handler => handler(payload));
    };

    this.ws.onclose = (event) => {
      clearTimeout(timeout);
      if (DEBUG) console.log('🔴 WebSocket disconnected', event.code, event.reason);
      this.connectionHandlers.forEach(handler => handler('disconnected'));
      this.connecting = false;
      this.stopKeepAlive();
      if (this.shouldReconnect) this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      clearTimeout(timeout);
      console.error('WebSocket connection error:', error);
      this.connectionHandlers.forEach(handler => handler('error'));
      this.connecting = false;
      this.stopKeepAlive();
      // Try next connection URL if provided
      if (onConnectionError) {
        onConnectionError();
      } else {
        reject(error);
      }
    };
  }

  handleReconnect() {
    if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      if (DEBUG) console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      // Exponential backoff for reconnection attempts
      const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000);
      setTimeout(() => this.connect().catch(() => { }), delay);
    } else {
      if (DEBUG) console.log('Max reconnection attempts reached. Backend may be offline.');
      this.connectionHandlers.forEach(handler => handler('failed'));
    }
  }

  sendMessage(message, sessionId, chatMode = 'standard', isWebSearch = false) {
    // Generate a unique chat/conversation ID for this message exchange
    const chatId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const payload = {
      message,
      sessionId: sessionId || this.currentSessionId,
      userId: this.userId,
      messageId: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), // Unique message ID
      chatId: chatId, // Unique chat/conversation ID
      chatMode: chatMode, // Add chat mode to payload (standard/plus for business)
      isWebSearch: isWebSearch // Pro mode (true) = enhanced search, Lite mode (false) = normal
    };
    if (DEBUG) console.log('📤 Sending message:', payload);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(payload));
        return { success: true, chatId: chatId };
      } catch (error) {
        console.error('❌ Error sending message:', error); // Debug: Log send error
        // fall through to queue
      }
    }
    // Queue and try to connect
    this.sendQueue.push(payload);
    this.connect().catch(() => { });
    return { success: false, chatId: chatId };
  }

  // New method to send stop signal
  sendStopSignal() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({
          message: "STOP_PROCESSING",
          sessionId: this.currentSessionId,
          userId: this.userId
        }));
        return true;
      } catch (error) {
        console.error('Error sending stop signal:', error);
        return false;
      }
    }
    return false;
  }

  addMessageHandler(handler) {
    this.messageHandlers.add(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers.delete(handler);
  }

  clearAllMessageHandlers() {
    this.messageHandlers.clear();
  }

  addConnectionHandler(handler) {
    this.connectionHandlers.add(handler);
  }

  removeConnectionHandler(handler) {
    this.connectionHandlers.delete(handler);
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) this.ws.close();
  }

  startKeepAlive() {
    this.stopKeepAlive();
    this.pingTimer = setInterval(() => {
      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
        }
      } catch {
        // ignore
      }
    }, 30000);
  }

  stopKeepAlive() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  /**
   * Manually trigger a reconnection attempt
   */
  async reconnect() {
    if (DEBUG) console.log('Manual reconnection attempt triggered');
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    return await this.connect();
  }

  /**
   * Check if the WebSocket is currently connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

}

// Create a singleton instance
export const wsManager = new WebSocketManager();

/**
 * Upload a file to the backend for ingestion
 * @param {File} file - File object to upload
 * @param {string} userId - Optional user ID for file organization
 */
export const uploadFile = async (file, userId = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    // Include user_id in form data if provided
    if (userId) {
      formData.append('user_id', userId);
    }

    // Also include user_id in headers for the new Flask-style endpoint
    const headers = {};
    if (userId) {
      headers['x-user-id'] = userId;
    }

    const res = await fetch(`${API_BASE_URL}/upload/`, {
      method: 'POST',
      body: formData,
      headers: headers
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Upload failed:', error);
    return { error: 'Upload failed due to network or server issue.' };
  }
};

/**
 * Delete a file from the backend
 * @param {string} userId - User ID
 * @param {string} fileName - Name of the file to delete
 */
export const deleteFile = async (userId, fileName) => {
  try {
    const encodedFileName = encodeURIComponent(fileName);
    const res = await fetch(`${API_BASE_URL}/delete/${userId}/${encodedFileName}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error(`Delete failed: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Delete failed:', error);
    return { error: 'Delete failed due to network or server issue.' };
  }
};