import { useAuth } from '../context/AuthContext';
import useChatCore from './chat/useChatCore';
import useChatSession from './chat/useChatSession';
import useChatMessages from './chat/useChatMessages';
import { copyMessageToClipboard, isElementScrollable } from './chat/useChatUtils';

export default function useChat(props) {
  const { currentSessionId, userId, onMessagesUpdate, chatMode: externalChatMode, onChatModeChange: externalOnChatModeChange, activePersonality, setActivePersonality, personalities } = props;
  const { userProfile } = useAuth();

  const core = useChatCore({
      currentSessionId,
      userId,
      externalChatMode,
      externalOnChatModeChange,
      userProfile,
      externalActivePersonality: activePersonality,
      externalSetActivePersonality: setActivePersonality,
      externalPersonalities: personalities
  });
  const session = useChatSession({ core, currentSessionId, userId, onMessagesUpdate });
  const messages = useChatMessages({ core, currentSessionId, userId, onMessagesUpdate });

  return { ...core, ...session, ...messages, copyMessageToClipboard, isElementScrollable };
}