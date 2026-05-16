import { create } from 'zustand';

export type FeedbackEvent = {
  id: string;
  type:
    | 'turn'
    | 'card_dealt'
    | 'bust'
    | 'frozen'
    | 'flip7'
    | 'stay'
    | 'round_end'
    | 'game_end'
    | 'game_start'
    | 'joined';
  playerId?: string;
  playerName?: string;
  playerEmoji?: string;
  value?: number;
  timestamp: number;
};

interface FeedbackState {
  events: FeedbackEvent[];
  announcements: FeedbackEvent[];
  addEvent: (event: Omit<FeedbackEvent, 'id' | 'timestamp'>) => void;
  clearAnnouncement: (id: string) => void;
  clearOldEvents: () => void;
}

const MAX_EVENTS = 20;
const ANNOUNCEMENT_DURATION = 2000;

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  events: [],
  announcements: [],

  addEvent: (event) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const fullEvent: FeedbackEvent = {
      ...event,
      id,
      timestamp: Date.now(),
    };

    const isMajor = [
      'bust',
      'frozen',
      'flip7',
      'round_end',
      'game_end',
      'game_start',
      'joined',
    ].includes(event.type);

    set((state) => ({
      events: [...state.events.slice(-MAX_EVENTS), fullEvent],
      announcements: isMajor
        ? [...state.announcements, fullEvent]
        : state.announcements,
    }));

    if (isMajor) {
      setTimeout(() => {
        get().clearAnnouncement(id);
      }, ANNOUNCEMENT_DURATION);
    }
  },

  clearAnnouncement: (id) => {
    set((state) => ({
      announcements: state.announcements.filter((a) => a.id !== id),
    }));
  },

  clearOldEvents: () => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    set((state) => ({
      events: state.events.filter((e) => e.timestamp > fiveMinutesAgo),
    }));
  },
}));

export const useLatestFeedback = () => {
  const events = useFeedbackStore((s) => s.events);
  return events[events.length - 1] ?? null;
};

export const useActiveAnnouncements = () => {
  return useFeedbackStore((s) => s.announcements);
};
