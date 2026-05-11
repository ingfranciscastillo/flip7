import { Link } from 'react-router';
import { motion } from 'motion/react';
import { getSocket } from '../lib/socket';
import { useGame, useIdentity } from '../store/gameStore';

export function GameOver() {
  const room = useGame((s) => s.room);
  const me = useIdentity();
  if (!room) return null;
  const winner = room.players.find((p) => p.id === room.winnerId);
  const ranking = [...room.players].sort((a, b) => b.totalScore - a.totalScore);
  const isHost = room.hostId === me.playerId;

  const playAgain = () => getSocket().emit('game:reset');

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card-surface p-6 max-w-md w-full text-center space-y-5"
      >
        <div className="text-6xl">🏆</div>
        <h1 className="text-2xl font-black">
          {winner?.emoji} {winner?.name} gana!
        </h1>
        <div className="space-y-1">
          {ranking.map((p, i) => (
            <div
              key={p.id}
              className="flex justify-between bg-surface2 rounded-xl px-3 py-2 text-sm"
            >
              <span>
                #{i + 1} {p.emoji} {p.name}
              </span>
              <span className="font-bold">{p.totalScore}</span>
            </div>
          ))}
        </div>
        {isHost ? (
          <button className="btn-primary w-full" onClick={playAgain}>
            Jugar otra vez
          </button>
        ) : (
          <p className="text-muted text-sm">Esperando al host…</p>
        )}
        <Link to="/" className="block text-muted text-sm">
          Volver al inicio
        </Link>
      </motion.div>
    </div>
  );
}
