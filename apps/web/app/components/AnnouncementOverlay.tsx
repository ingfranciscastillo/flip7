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
      container: 'bg-danger/15 backdrop-blur-sm',
      icon: '💥',
      title: '¡BUST!',
      titleClass: 'text-danger feedback-shake',
      subtitle: `${event.playerEmoji ?? ''} ${event.playerName ?? 'Jugador'}`,
      subtitleClass: 'text-danger/80',
    },
    frozen: {
      container: 'bg-blue-400/15 backdrop-blur-sm',
      icon: '❄️',
      title: '¡CONGELADO!',
      titleClass: 'text-blue-400 feedback-freeze',
      subtitle: `${event.playerEmoji ?? ''} ${event.playerName ?? 'Jugador'}`,
      subtitleClass: 'text-blue-400/80',
    },
    flip7: {
      container: 'bg-gold/15 backdrop-blur-sm',
      icon: '🎰',
      title: '¡FLIP 7!',
      titleClass: 'text-gold feedback-glow',
      subtitle: `${event.playerEmoji ?? ''} ${event.playerName ?? 'Jugador'}`,
      subtitleClass: 'text-gold/80',
    },
    // round_end: {
    //   container: 'bg-accent/15 backdrop-blur-sm',
    //   icon: '🏆',
    //   title: '¡RONDA COMPLETA!',
    //   titleClass: 'text-accent feedback-bounce-in',
    //   subtitle: 'Preparándose para la siguiente...',
    //   subtitleClass: 'text-accent/80',
    // },
    game_end: {
      container: 'bg-success/15 backdrop-blur-sm',
      icon: '🎉',
      title: '¡FIN DE PARTIDA!',
      titleClass: 'text-success feedback-bounce-in',
      subtitle: `${event.playerEmoji ?? ''} ${event.playerName ?? 'Ganador'}`,
      subtitleClass: 'text-success/80',
    },
    game_start: {
      container: 'bg-primary/15 backdrop-blur-sm',
      icon: '🎮',
      title: '¡A JUGAR!',
      titleClass: 'text-primary feedback-glow',
      subtitle: 'La partida ha comenzado',
      subtitleClass: 'text-primary/80',
    },
    turn: {
      container: 'bg-surface/50 backdrop-blur-sm',
      icon: event.playerEmoji ?? '🎯',
      title: `Turno de ${event.playerName ?? 'Jugador'}`,
      titleClass: 'text-ink',
      subtitle: '',
      subtitleClass: '',
    },
    stay: {
      container: 'bg-surface/50 backdrop-blur-sm',
      icon: '✋',
      title: `${event.playerEmoji ?? ''} ${event.playerName ?? 'Jugador'} se planta`,
      titleClass: 'text-muted feedback-slide-up',
      subtitle: '',
      subtitleClass: '',
    },
    card_dealt: null,
  };

  const config = variants[event.type as keyof typeof variants];
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none ${config.container}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 12 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.05, type: 'spring', damping: 10 }}
          className="text-7xl mb-4 feedback-bounce-in"
        >
          {config.icon}
        </motion.div>
        <motion.h2
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 8 }}
          className={`text-5xl md:text-6xl font-black mb-2 ${config.titleClass}`}
        >
          {config.title}
        </motion.h2>
        {config.subtitle && (
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-xl ${config.subtitleClass}`}
          >
            {config.subtitle}
          </motion.p>
        )}
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
