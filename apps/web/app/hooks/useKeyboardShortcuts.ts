import { useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { useGame, useIdentity } from '../store/gameStore';

export function useKeyboardShortcuts() {
  const room = useGame((s) => s.room);
  const myId = useIdentity((s) => s.playerId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        if (e.key === 'Enter') {
          return;
        }
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
          return;
        }
        return;
      }

      if (e.key === 'Escape') {
        return;
      }

      const isMyTurn = room?.currentTurnPlayerId === myId;
      const isPlaying = room?.phase === 'playing';

      if (e.key.toLowerCase() === 'h' && isMyTurn && isPlaying) {
        e.preventDefault();
        getSocket().emit('turn:hit');
      }

      if (e.key.toLowerCase() === 's' && isMyTurn && isPlaying) {
        e.preventDefault();
        getSocket().emit('turn:stay');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [room, myId]);
}
