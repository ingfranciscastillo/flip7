import { AnimatePresence, motion } from 'motion/react';
import { useActiveAnnouncements } from '../store/feedbackStore';
import type { FeedbackEvent } from '../store/feedbackStore';

interface AnnouncementProps {
  event: FeedbackEvent;
  onComplete: (id: string) => void;
}

function Announcement({ event, onComplete }: AnnouncementProps) {
  const variants = {
    bust: {
      container: 'bg-danger/20 backdrop-blur-md rounded-lg',
      icon: '💥',
      title: '¡BUST!',
      titleClass: 'text-danger',
      subtitle: `${event.playerEmoji ?? ''} ${event.playerName ?? 'Jugador'}`,
      subtitleClass: 'text-danger/80',
    },
    frozen: {
      container: 'bg-blue-400/20 backdrop-blur-md rounded-lg',
      icon: '❄️',
      title: '¡CONGELADO!',
      titleClass: 'text-blue-400',
      subtitle: `${event.playerEmoji ?? ''} ${event.playerName ?? 'Jugador'}`,
      subtitleClass: 'text-blue-400/80',
    },
    flip7: {
      container: 'bg-gold/20 backdrop-blur-md rounded-lg',
      icon: '🎰',
      title: '¡FLIP 7!',
      titleClass: 'text-gold',
      subtitle: `${event.playerEmoji ?? ''} ${event.playerName ?? 'Jugador'}`,
      subtitleClass: 'text-gold/80',
    },
    game_end: {
      container: 'bg-success/20 backdrop-blur-md rounded-lg',
      icon: '🎉',
      title: '¡FIN DE PARTIDA!',
      titleClass: 'text-success',
      subtitle: `${event.playerEmoji ?? ''} ${event.playerName ?? 'Ganador'}`,
      subtitleClass: 'text-success/80',
    },
    game_start: {
      container: 'bg-primary/20 backdrop-blur-md rounded-lg',
      icon: '🎮',
      title: '¡A JUGAR!',
      titleClass: 'text-primary',
      subtitle: 'La partida ha comenzado',
      subtitleClass: 'text-primary/80',
    },
    turn: {
      container: 'bg-surface/90 backdrop-blur-md rounded-lg',
      icon: event.playerEmoji ?? '🎯',
      title: `Turno de ${event.playerName ?? 'Jugador'}`,
      titleClass: 'text-ink',
      subtitle: '',
      subtitleClass: '',
    },
    stay: {
      container: 'bg-surface/90 backdrop-blur-md rounded-lg',
      icon: '✋',
      title: `${event.playerEmoji ?? ''} ${event.playerName ?? 'Jugador'} se planta`,
      titleClass: 'text-muted',
      subtitle: '',
      subtitleClass: '',
    },
    joined: {
      container: 'bg-surface/90 backdrop-blur-md rounded-lg',
      icon: '👋',
      title: `${event.playerEmoji ?? ''} ${event.playerName ?? 'Jugador'} se unió`,
      titleClass: 'text-ink',
      subtitle: '',
      subtitleClass: '',
    },
    card_dealt: null,
  };

  const config = variants[event.type as keyof typeof variants];
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`fixed bottom-4 right-4 z-50 flex pointer-events-none ${config.container}`}
      role="alert"
      aria-live="polite"
    >
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.05, type: 'spring', damping: 15 }}
        className="flex items-center gap-3 px-4 py-3"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.02, type: 'spring', damping: 12 }}
          className="text-2xl"
        >
          {config.icon}
        </motion.span>
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className={`text-sm font-bold ${config.titleClass}`}
          >
            {config.title}
          </motion.p>
          {config.subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`text-xs ${config.subtitleClass}`}
            >
              {config.subtitle}
            </motion.p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AnnouncementOverlay() {
  const announcements = useActiveAnnouncements();

  return (
    <AnimatePresence mode="popLayout">
      {announcements.map((event) => (
        <Announcement
          key={event.id}
          event={event}
          onComplete={(id) => {
            const store =
              require('../store/feedbackStore').useFeedbackStore.getState();
            store.clearAnnouncement(id);
          }}
        />
      ))}
    </AnimatePresence>
  );
}
