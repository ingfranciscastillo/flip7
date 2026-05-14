import { useParams, Navigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { getSocket } from '../lib/socket';
import { useGame, useIdentity } from '../store/gameStore';
import { PlayerSeat } from '../components/PlayerSeat';
import { Table } from '../components/Table';
import { TurnIndicator } from '../components/TurnIndicator';
import { AnnouncementOverlay } from '../components/AnnouncementOverlay';
import { ConfettiCelebration } from '../components/ConfettiCelebration';
import { ChatBox } from '../components/ChatBox';
import { ConnectionStatus } from '../components/ConnectionStatus';

export function meta({ params }: { params: { code?: string } }) {
  return [
    { title: `Partida ${params.code || ''} - Flip 7 Online` },
    {
      name: 'description',
      content:
        'Partida de Flip 7 Online en curso. ¡Demuestra tu suerte y estrategia!',
    },
    {
      property: 'og:url',
      content: `https://flip7-web.vercel.app/game/${params.code || ''}`,
    },
  ];
}

export default function Game() {
  const { code = '' } = useParams();
  const room = useGame((s) => s.room);
  const me = useIdentity();

  if (!me.playerId || !me.roomCode) {
    return <Navigate to="/" replace />;
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted">Conectando a la partida...</p>
        </div>
      </div>
    );
  }

  const myId = me.playerId;
  const isHost = room.hostId === myId;
  const myTurn = room.currentTurnPlayerId === myId && room.phase === 'playing';
  const pending = room.pendingTarget;
  const iAmSource = pending?.sourcePlayerId === myId;
  const turnPlayer = room.players.find(
    (p) => p.id === room.currentTurnPlayerId,
  );

  const hit = () => getSocket().emit('turn:hit');
  const stay = () => getSocket().emit('turn:stay');
  const target = (targetId: string) => {
    if (!pending) return;
    getSocket().emit('card:target', {
      cardId: pending.cardId,
      targetPlayerId: targetId,
    });
  };
  const leaveGame = () => {
    getSocket().emit('room:leave');
    me.clearIdentity();
    window.location.href = '/';
  };
  const resetGame = () => {
    if (
      window.confirm(
        '¿Seguro que quieres reiniciar la sala? Se perderá todo el progreso.',
      )
    ) {
      getSocket().emit('game:reset');
    }
  };
  const nextRound = () => getSocket().emit('game:start');

  return (
    <div className="min-h-screen p-3 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="pill bg-surface2 text-muted">Sala {code}</span>
          <ConnectionStatus minimal />
        </div>
        <div className="flex items-center gap-2">
          <span className="pill bg-surface2 text-muted">
            Ronda {room.round}
          </span>
          {isHost && (
            <button
              className="pill bg-danger/20 text-danger hover:bg-danger/30"
              onClick={resetGame}
            >
              Reiniciar sala
            </button>
          )}
          <button
            className="pill bg-surface2 text-muted hover:bg-accent/30"
            onClick={leaveGame}
          >
            Salir
          </button>
        </div>
      </div>

      <div className="flex justify-center mb-3">
        {turnPlayer && (
          <TurnIndicator
            name={turnPlayer.name}
            emoji={turnPlayer.emoji}
            isMe={turnPlayer.id === myId}
          />
        )}
      </div>

      <Table deckCount={room.deckCount} discardCount={room.discardCount} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <AnimatePresence>
          {room.players.map((p) => {
            const selectable = !!pending && iAmSource && p.status === 'active';
            return (
              <PlayerSeat
                key={p.id}
                player={p}
                isCurrentTurn={p.id === room.currentTurnPlayerId}
                isMe={p.id === myId}
                selectable={selectable}
                onClick={selectable ? () => target(p.id) : undefined}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {pending && iAmSource && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-24 left-0 right-0 text-center pointer-events-none"
        >
          <span className="pill bg-primary/30 text-primary">
            Selecciona un objetivo para{' '}
            {pending.action === 'freeze' ? 'congelar ❄️' : 'forzar Flip 3 🔁'}
          </span>
        </motion.div>
      )}

      {room.phase === 'playing' && myTurn && !pending && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-linear-to-t from-bg via-bg/90 to-transparent">
          <div className="max-w-md mx-auto flex gap-3">
            <button className="btn-primary flex-1 text-lg" onClick={hit}>
              Hit
            </button>
            <button className="btn-ghost flex-1 text-lg" onClick={stay}>
              Stay
            </button>
          </div>
        </div>
      )}

      {room.phase === 'round_end' && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-linear-to-t from-bg via-bg/90 to-transparent">
          <div className="max-w-md mx-auto card-surface p-4 text-center space-y-3">
            <h3 className="font-bold text-lg">Ronda {room.round} terminada</h3>
            <div className="space-y-1 text-sm">
              {[...room.players]
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((p) => (
                  <div key={p.id} className="flex justify-between">
                    <span>
                      {p.emoji} {p.name}
                    </span>
                    <span className="font-bold">{p.totalScore}</span>
                  </div>
                ))}
            </div>
            {room.hostId === myId && (
              <button className="btn-primary w-full" onClick={nextRound}>
                Siguiente ronda
              </button>
            )}
          </div>
        </div>
      )}

      <AnnouncementOverlay />
      <ConfettiCelebration />
      <ChatBox roomCode={code} />
    </div>
  );
}
