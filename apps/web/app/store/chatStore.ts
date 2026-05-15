import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  emoji: string;
  message: string;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  lastSeenTimestamp: number;
  typingUsers: string[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  markAsSeen: () => void;
  setTyping: (playerId: string, isTyping: boolean) => void;
}

const MAX_MESSAGES = 50;

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isOpen: false,
  lastSeenTimestamp: 0,
  typingUsers: [],

  setTyping: (playerId, isTyping) => {
    set((state) => ({
      typingUsers: isTyping
        ? [...state.typingUsers.filter((id) => id !== playerId), playerId]
        : state.typingUsers.filter((id) => id !== playerId),
    }));
  },

  addMessage: (msg) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const fullMessage: ChatMessage = {
      ...msg,
      id,
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages.slice(-MAX_MESSAGES), fullMessage],
    }));
  },

  clearMessages: () => {
    set({ messages: [], lastSeenTimestamp: Date.now() });
  },

  toggleOpen: () => {
    set((state) => {
      if (!state.isOpen) {
        return { isOpen: true, lastSeenTimestamp: Date.now() };
      }
      return { isOpen: false };
    });
  },

  setOpen: (open) => {
    set((state) => ({
      isOpen: open,
      ...(open ? { lastSeenTimestamp: Date.now() } : {}),
    }));
  },

  markAsSeen: () => {
    set({ lastSeenTimestamp: Date.now() });
  },
}));
