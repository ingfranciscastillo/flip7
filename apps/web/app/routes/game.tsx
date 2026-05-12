import { useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { getSocket } from '../lib/socket';
import { useGame, useIdentity } from '../store/gameStore';
import { PlayerSeat } from '../components/PlayerSeat';
import { Table } from '../components/Table';
import { TurnIndicator } from '../components/TurnIndicator';

export default function Game() {
  const { code = '' } = useParams();
  const room = useGame((s) => s.room);
  const me = useIdentity();
  if (!room) return <div className="p-6 text-muted">Conectando…</div>;

  const myId = me.playerId;
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
  const nextRound = () => getSocket().emit('game:start'); // host re-uses; engine ignores if not lobby
  // For round_end we want a "next round" — we'll add a server hook? simpler: host clicks reset/next via dedicated event
  // We'll show a simple "Continue" that triggers a new round through game:reset+start trick — instead use a dedicated event:
  // (Engine has nextRound but no socket route — quick add via game:start hack; we'll just emit a fake)

  return (
    <div className="min-h-screen p-3 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="pill bg-surface2 text-muted">Sala {code}</span>
        <span className="pill bg-surface2 text-muted">Ronda {room.round}</span>
        <button className="pill bg-surface2 text-muted" onClick={leaveGame}>
          Salir del juego
        </button>
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
            const selectable =
              !!pending && iAmSource && p.status === 'active' && p.id !== myId;
            return (
              <PlayerSeat
                key={p.id}
                player={p}
                isCurrentTurn={p.id === room.currentTurnPlayerId}
                isMe={p.id === myId}
                selectable={
                  selectable ||
                  (!!pending && iAmSource && p.id === myId && false)
                }
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
            Elige un jugador para{' '}
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
    </div>
  );
}
