import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { getSocket } from '../lib/socket';
import { useGame, useIdentity } from '../store/gameStore';

export function useSocketLifecycle() {
  const setRoom = useGame((s) => s.setRoom);
  const setLastDealt = useGame((s) => s.setLastDealt);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();

    const onState = (state: Parameters<typeof setRoom>[0]) => {
      setRoom(state);
      if (!state) return;
      // route by phase
      if (state.phase === 'lobby') navigate(`/lobby/${state.code}`);
      else if (state.phase === 'playing' || state.phase === 'round_end')
        navigate(`/game/${state.code}`);
      else if (state.phase === 'game_end') navigate(`/over/${state.code}`);
    };
    const onCardDealt = (data: { playerId: string; card: { id: string } }) => {
      setLastDealt(data.card.id);
    };
    const onError = (e: { code: string; message: string }) => {
      toast.error(e.message || e.code);
    };
    const onBusted = (id: string) => {
      const room = useGame.getState().room;
      const p = room?.players.find((x) => x.id === id);
      toast.error(`${p?.emoji ?? ''} ${p?.name ?? 'Jugador'} se pasó!`);
    };
    const onFlip7 = (id: string) => {
      const p = useGame.getState().room?.players.find((x) => x.id === id);
      toast.success(`🔥 ${p?.name ?? 'Jugador'} hizo Flip 7!`);
    };
    const onGameEnd = (winnerId: string) => {
      const p = useGame.getState().room?.players.find((x) => x.id === winnerId);
      toast.success(`🏆 ${p?.name ?? 'Jugador'} ganó la partida!`);
    };
    const onDisconnected = (id: string) => {
      const p = useGame.getState().room?.players.find((x) => x.id === id);
      toast.warning(`${p?.emoji ?? ''} ${p?.name ?? 'Jugador'} se desconectó`);
    };
    const onReconnected = (id: string) => {
      const p = useGame.getState().room?.players.find((x) => x.id === id);
      toast.success(`${p?.emoji ?? ''} ${p?.name ?? 'Jugador'} se reconectó`);
    };
    const onGameStarted = () => {
      toast.info('¡El host ha iniciado una nueva partida!');
    };
    const onGameReset = () => {
      toast.info('La sala ha sido reiniciada');
    };
    const onConnect = () => {
      const id = useIdentity.getState();
      if (id.playerId && id.roomCode) {
        socket.emit(
          'room:rejoin',
          { code: id.roomCode, playerId: id.playerId },
          (res: { ok: true } | { ok: false; error: string }) => {
            if (!res.ok) {
              useIdentity.getState().clearIdentity();
            }
          },
        );
      }
    };

    socket.on('connect', onConnect);
    socket.on('room:state', onState);
    socket.on('card:dealt', onCardDealt);
    socket.on('error', onError);
    socket.on('player:busted', onBusted);
    socket.on('player:flip7', onFlip7);
    socket.on('game:ended', onGameEnd);
    socket.on('game:started', onGameStarted);
    socket.on('game:reset', onGameReset);
    socket.on('player:disconnected', onDisconnected);
    socket.on('player:reconnected', onReconnected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('room:state', onState);
      socket.off('card:dealt', onCardDealt);
      socket.off('error', onError);
      socket.off('player:busted', onBusted);
      socket.off('player:flip7', onFlip7);
      socket.off('game:ended', onGameEnd);
      socket.off('game:started', onGameStarted);
      socket.off('game:reset', onGameReset);
      socket.off('player:disconnected', onDisconnected);
      socket.off('player:reconnected', onReconnected);
    };
  }, [setRoom, setLastDealt, navigate]);
}
