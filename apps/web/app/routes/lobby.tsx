import { Link, useParams, Navigate } from 'react-router';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Copy01FreeIcons, UserMultipleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { getSocket } from '../lib/socket';
import { useGame, useIdentity } from '../store/gameStore';
import { ConfettiCelebration } from '../components/ConfettiCelebration';
import { ChatBox } from '../components/ChatBox';
import { ConnectionStatus } from '../components/ConnectionStatus';

export function meta({ params }: { params: { code?: string } }) {
  return [
    { title: `Sala ${params.code || ''} - Flip 7 Online` },
    {
      name: 'description',
      content:
        'Sala de espera de Flip 7 Online. Invita a tus amigos y empieza la partida.',
    },
    {
      property: 'og:url',
      content: `https://flip7-web.vercel.app/lobby/${params.code || ''}`,
    },
  ];
}

export default function Lobby() {
  const { code = '' } = useParams();
  const room = useGame((s) => s.room);
  const me = useIdentity();

  if (!me.playerId || !me.roomCode) {
    return <Navigate to="/" replace />;
  }

  const isHost = room?.hostId === me.playerId;
  const enoughPlayers = (room?.players.length ?? 0) >= 3;

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    toast.success('Código copiado');
  };

  const start = () => getSocket().emit('game:start');
  const leave = () => {
    getSocket().emit('room:leave');
    me.clearIdentity();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="card-surface p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">
              Código de sala
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={copy}
                className="flex items-center gap-2 text-3xl font-black tracking-widest"
              >
                {code}
                <HugeiconsIcon
                  icon={Copy01FreeIcons}
                  className="w-5 h-5 text-muted"
                />
              </button>
              <ConnectionStatus minimal />
            </div>
          </div>
          <span className="pill bg-accent/20 text-accent">
            <HugeiconsIcon icon={UserMultipleIcon} className="w-3 h-3" />{' '}
            {room?.players.length ?? 0}/8
          </span>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {room?.players.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-surface2 border border-border"
              >
                <span className="text-2xl">{p.emoji}</span>
                <span className="flex-1 font-semibold">{p.name}</span>
                {p.isHost && (
                  <span className="pill bg-gold/30 text-gold">HOST</span>
                )}
                {p.id === me.playerId && (
                  <span className="pill bg-accent/30 text-accent">TÚ</span>
                )}
                {!p.connected && (
                  <span className="pill bg-muted/30 text-muted">Offline</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {isHost ? (
          <button
            className="btn-primary w-full"
            onClick={start}
            disabled={!enoughPlayers}
          >
            {enoughPlayers ? 'Empezar partida' : 'Mínimo 3 jugadores'}
          </button>
        ) : (
          <p className="text-center text-muted text-sm">
            Esperando a que el host empiece la partida…
          </p>
        )}

        <button className="btn-ghost w-full" onClick={leave}>
          Salir
        </button>
      </div>
      <ConfettiCelebration />
      <ChatBox roomCode={code} />
    </div>
  );
}
