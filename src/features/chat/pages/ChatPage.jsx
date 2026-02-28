import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import ReactDOM from 'react-dom';
import ChatHistory from '../components/ChatHistory.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import ChatWindowHeader from '../components/ChatWindowHeader.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { LoadingSpinner } from '../../../components/loading';
import { generateChatPDF } from '../../../utils/pdfGenerator.js';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../../utils/firebaseConfig.js';
import { collection, query, orderBy, onSnapshot, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import ChatService from '../../../services/chatService';

const ChatSkeleton = () => (
  <div className="flex h-full w-full bg-[#0a0d14] items-center justify-center">
    <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-600 animate-pulse">Initializing Interface...</div>
  </div>
);

function AppContent() {
  const { currentUser: user, userProfile } = useAuth();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [shareLoading, setShareLoading] = useState(false);
  const [chatMode, setChatMode] = useState('normal');
  const [personalities, setPersonalities] = useState([]);
  const [activePersonality, setActivePersonality] = useState(null);

  const isNavigatingRef = useRef(false);
  const lastUrlSessionRef = useRef(chatId);

  useEffect(() => {
    const uid = userProfile?.uniqueUserId;
    if (uid) {
        ChatService.getPersonalities(uid).then(result => {
            if (result.success && result.personalities) {
                setPersonalities(result.personalities);
                if (activePersonality) {
                    const updated = result.personalities.find(p => p.id === activePersonality.id);
                    if (updated) setActivePersonality(updated);
                }
                if (!activePersonality) {
                    const def = result.personalities.find(p => p.is_default && p.id === 'default_relyce') || result.personalities[0];
                    setActivePersonality(def);
                }
            } else {
                const defaultPersonality = { id: 'default_relyce', name: 'Relyce AI', description: 'Professional assistant', is_default: true };
                setPersonalities([defaultPersonality]);
                if (!activePersonality) setActivePersonality(defaultPersonality);
            }
        }).catch(err => {
            console.error(err);
            const defaultPersonality = { id: 'default_relyce', name: 'Relyce AI', description: 'Professional assistant', is_default: true };
            setPersonalities([defaultPersonality]);
            if (!activePersonality) setActivePersonality(defaultPersonality);
        });
    }
  }, [userProfile?.uniqueUserId]);

  const handleSetActivePersonality = useCallback((persona) => {
      setActivePersonality(persona);
      if (currentSessionId && user?.uid && persona?.id) {
          ChatService.updateSessionPersonality(user.uid, currentSessionId, persona.id);
      }
  }, [currentSessionId, user]);

  useEffect(() => {
    if (!currentSessionId || !chatSessions.length || !personalities.length) return;
    const currentSession = chatSessions.find(s => s.id === currentSessionId);
    
    if (currentSession?.personalityId) {
        const savedPersona = personalities.find(p => p.id === currentSession.personalityId);
        if (savedPersona && savedPersona.id !== activePersonality?.id) {
            setActivePersonality(savedPersona);
        }
    } else {
        if (activePersonality?.id !== 'default_relyce') {
             const defaultPersona = personalities.find(p => p.is_default && p.id === 'default_relyce') || personalities[0];
             // Prevent infinite loop: Only set if the ID actually changed
             if (defaultPersona && activePersonality?.id !== defaultPersona.id) {
                 setActivePersonality(defaultPersona);
             }
        }
    }
  }, [currentSessionId, chatSessions, personalities, activePersonality?.id]);

  const memoizedChatSessions = useMemo(() => chatSessions || [], [chatSessions?.length]);

  useEffect(() => {
    if (chatId) lastUrlSessionRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    const handleCloseSidebar = () => setShowSidebar(false);
    window.addEventListener('closeSidebar', handleCloseSidebar);
    return () => window.removeEventListener('closeSidebar', handleCloseSidebar);
  }, []);

  const handleDownloadPDF = async () => {
    if (!messages || messages.length === 0) return;
    try {
      const blob = await generateChatPDF(messages, { title: 'Chat Conversation', date: new Date(), participants: ['User', 'Relyce AI'] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relyce-chat-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadText = () => {
    if (!messages || messages.length === 0) return;
    try {
      const textContent = messages.map(msg => `[${msg.role.toUpperCase()}] (${new Date(msg.timestamp?.toDate ? msg.timestamp.toDate() : msg.createdAt).toLocaleString()})\n${msg.content}\n`).join('\n');
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relyce-chat-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetCurrentSession = useCallback((id) => {
    if (currentSessionId === id) { setShowSidebar(false); return; }
    setCurrentSessionId(id);
    setShowSidebar(false);
    window.history.replaceState(null, '', `/chat/${id}`);
  }, [currentSessionId]);

  const handleShareChat = useCallback(async () => {
    if (!currentSessionId || !user || messages.length === 0) return;
    setShareLoading(true);
    try {
      const shareId = crypto.randomUUID().slice(0, 8);
      const currentSession = chatSessions.find(s => s.id === currentSessionId);
      const sessionName = currentSession?.name || 'Chat Conversation';
      await addDoc(collection(db, 'sharedChats'), {
        shareId: shareId, originalSessionId: currentSessionId, ownerId: user.uid, title: sessionName,
        messages: messages.map(msg => ({ role: msg.role, content: msg.content, timestamp: msg.timestamp || msg.createdAt })),
        isPublic: true, sharedAt: serverTimestamp(), messageCount: messages.length
      });
      const shareUrl = `${window.location.origin}/shared/${shareId}`;
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setShareLoading(false);
    }
  }, [currentSessionId, user, messages, chatSessions]);

  const handleToggleSidebarExpanded = useCallback((expanded) => setSidebarExpanded(expanded), []);

  const createNewSession = useCallback(async () => {
    if (!user) return;
    const newSessionId = crypto.randomUUID();
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setShowSidebar(false);
    navigate(`/chat/${newSessionId}`, { replace: true });
    setDoc(doc(db, 'users', user.uid, 'chatSessions', newSessionId), { name: 'New Session', createdAt: serverTimestamp() }).catch(e => console.error(e));
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setLoadingChats(true);
      const chatRef = collection(db, 'users', user.uid, 'chatSessions');
      const q = query(chatRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setChatSessions(sessions);
          if (snapshot.metadata.hasPendingWrites) return;
          if (chatId && chatId !== currentSessionId && !isNavigatingRef.current) {
            if (sessions.find((s) => s.id === chatId)) setCurrentSessionId(chatId);
            else if (sessions.length > 0) { setCurrentSessionId(sessions[0].id); navigate(`/chat/${sessions[0].id}`, { replace: true }); }
          } else if (!chatId && sessions.length > 0 && !currentSessionId) {
            setCurrentSessionId(sessions[0].id); navigate(`/chat/${sessions[0].id}`, { replace: true });
          } else if (!chatId && sessions.length === 0) {
            createNewSession();
          }
          setLoadingChats(false);
        }, (error) => { console.error(error); setLoadingChats(false); }
      );
      return () => unsubscribe();
    } else {
      setChatSessions([]); setCurrentSessionId(null); setLoadingChats(false);
    }
  }, [user, createNewSession, chatId, navigate]);

  const handleMessagesUpdate = useCallback((newMessages) => setMessages(newMessages), []);

  if (loadingChats) return <ChatSkeleton />;

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden bg-[#0a0d14] text-white">
      <Helmet><title>Interface | Relyce</title><meta name="robots" content="noindex" /></Helmet>
      
      {/* ── Minimalist Premium Background ───────────────────────── */}

      {/* Persistent subtle noise texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-0" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Abstract Blur Orbs - drastically toned down */}
      <div className="fixed -top-[10%] -right-[10%] w-[50vw] h-[50vw] bg-emerald-500/[0.02] rounded-full blur-[120px] mix-blend-screen pointer-events-none z-0" />
      <div className="fixed top-[60%] -left-[10%] w-[40vw] h-[40vw] bg-zinc-500/[0.02] rounded-full blur-[120px] mix-blend-screen pointer-events-none z-0" />

      <div className="flex h-full w-full relative z-10">
        <ChatHistory
          chatSessions={memoizedChatSessions} currentSessionId={currentSessionId} setCurrentSessionId={handleSetCurrentSession}
          createNewSession={createNewSession} onToggleSidebar={handleToggleSidebarExpanded}
          className={`z-40 flex-shrink-0 ${showSidebar ? 'fixed inset-y-0 left-0 w-3/5 max-w-xs md:relative md:w-auto' : 'hidden md:block'}`}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative min-w-0 w-full">
          <ChatWindowHeader 
             onToggleSidebar={() => { if (window.innerWidth < 768) setShowSidebar(true); else setSidebarExpanded(!sidebarExpanded); }}
             sidebarExpanded={sidebarExpanded} currentSessionId={currentSessionId} userId={user?.uid} userUniqueId={userProfile?.uniqueUserId}
             messages={messages} chatMode={chatMode} onChatModeChange={setChatMode} onDownloadPDF={handleDownloadPDF} onDownloadText={handleDownloadText} onShare={handleShareChat}
             onCopyLink={async () => { if (!currentSessionId) return; await navigator.clipboard.writeText(`${window.location.origin}/chat/${currentSessionId}`); }}
             onDelete={() => { console.log("Delete clicked"); }} personalities={personalities} activePersonality={activePersonality} setActivePersonality={handleSetActivePersonality} setPersonalities={setPersonalities}
          />
          {!loadingChats && (
            <ChatWindow
              currentSessionId={currentSessionId} userId={user?.uid} chatSessions={memoizedChatSessions} sidebarExpanded={sidebarExpanded}
              onToggleSidebar={() => { if (window.innerWidth < 768) setShowSidebar(true); else setSidebarExpanded(!sidebarExpanded); }}
              onMessagesUpdate={handleMessagesUpdate} chatMode={chatMode} onChatModeChange={setChatMode} activePersonality={activePersonality} setActivePersonality={handleSetActivePersonality} personalities={personalities} showHeader={false} 
            />
          )}
        </main>

        {showSidebar && <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-30" onClick={() => setShowSidebar(false)} />}
      </div>
    </div>
  );
}

export default AppContent;
