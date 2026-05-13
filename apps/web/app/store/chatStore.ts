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
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
}

const MAX_MESSAGES = 50;

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isOpen: false,

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
    set({ messages: [] });
  },

  toggleOpen: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  setOpen: (open) => {
    set({ isOpen: open });
  },
}));
