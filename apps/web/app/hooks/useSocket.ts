import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { getSocket } from '../lib/socket';
import { useGame, useIdentity } from '../store/gameStore';
import { useFeedbackStore } from '../store/feedbackStore';
import { useChatStore } from '../store/chatStore';
import type { ChatMessagePayload } from '@flip7/shared';

export function useSocketLifecycle() {
  const setRoom = useGame((s) => s.setRoom);
  const setLastDealt = useGame((s) => s.setLastDealt);
  const setLastDealtCard = useGame((s) => s.setLastDealtCard);
  const addFeedback = useFeedbackStore((s) => s.addEvent);
  const addChatMessage = useChatStore((s) => s.addMessage);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();

    const onState = (state: Parameters<typeof setRoom>[0]) => {
      setRoom(state);
      if (!state) return;
      if (state.phase === 'lobby') navigate(`/lobby/${state.code}`);
      else if (state.phase === 'playing' || state.phase === 'round_end')
        navigate(`/game/${state.code}`);
      else if (state.phase === 'game_end') navigate(`/over/${state.code}`);
    };

    const onCardDealt = (data: { playerId: string; card: { id: string } }) => {
      setLastDealt(data.card.id);
      setLastDealtCard({ id: data.card.id, playerId: data.playerId });
      const room = useGame.getState().room;
      const p = room?.players.find((x) => x.id === data.playerId);
      addFeedback({
        type: 'card_dealt',
        playerId: data.playerId,
        playerName: p?.name,
        playerEmoji: p?.emoji,
      });
    };

    const onError = (e: { code: string; message: string }) => {
      toast.error(e.message || e.code);
    };

    const onBusted = (id: string) => {
      const room = useGame.getState().room;
      const p = room?.players.find((x) => x.id === id);
      addFeedback({
        type: 'bust',
        playerId: id,
        playerName: p?.name,
        playerEmoji: p?.emoji,
      });
      toast.error(`${p?.emoji ?? ''} ${p?.name ?? 'Jugador'} se pasó!`);
    };

    const onFlip7 = (id: string) => {
      const p = useGame.getState().room?.players.find((x) => x.id === id);
      addFeedback({
        type: 'flip7',
        playerId: id,
        playerName: p?.name,
        playerEmoji: p?.emoji,
      });
      toast.success(`🔥 ${p?.name ?? 'Jugador'} hizo Flip 7!`);
    };

    const onFrozen = (id: string) => {
      const p = useGame.getState().room?.players.find((x) => x.id === id);
      addFeedback({
        type: 'frozen',
        playerId: id,
        playerName: p?.name,
        playerEmoji: p?.emoji,
      });
      toast.warning(`${p?.emoji ?? ''} ${p?.name ?? 'Jugador'} fue congelado!`);
    };

    const onStayed = (id: string) => {
      const p = useGame.getState().room?.players.find((x) => x.id === id);
      addFeedback({
        type: 'stay',
        playerId: id,
        playerName: p?.name,
        playerEmoji: p?.emoji,
      });
    };

    const onTurnChanged = (playerId: string) => {
      const p = useGame.getState().room?.players.find((x) => x.id === playerId);
      addFeedback({
        type: 'turn',
        playerId,
        playerName: p?.name,
        playerEmoji: p?.emoji,
      });
    };

    const onGameEnd = (winnerId: string) => {
      const p = useGame.getState().room?.players.find((x) => x.id === winnerId);
      addFeedback({
        type: 'game_end',
        playerId: winnerId,
        playerName: p?.name,
        playerEmoji: p?.emoji,
      });
      toast.success(`🏆 ${p?.name ?? 'Jugador'} ganó la partida!`);
    };

    const onRoundEnd = () => {
      addFeedback({ type: 'round_end' });
    };

    const onGameStarted = () => {
      addFeedback({ type: 'game_start' });
      toast.info('¡El host ha iniciado una nueva partida!');
    };

    const onGameReset = () => {
      toast.info('La sala ha sido reiniciada');
    };

    const onDisconnected = (id: string) => {
      const p = useGame.getState().room?.players.find((x) => x.id === id);
      toast.warning(`${p?.emoji ?? ''} ${p?.name ?? 'Jugador'} se desconectó`);
    };

    const onReconnected = (id: string) => {
      const p = useGame.getState().room?.players.find((x) => x.id === id);
      toast.success(`${p?.emoji ?? ''} ${p?.name ?? 'Jugador'} se reconectó`);
    };

    const onChatMessage = (payload: ChatMessagePayload) => {
      addChatMessage({
        playerId: payload.playerId,
        playerName: payload.playerName,
        emoji: payload.emoji,
        message: payload.message,
      });
      useChatStore.getState().setTyping(payload.playerId, false);
    };

    const onTyping = (playerId: string) => {
      useChatStore.getState().setTyping(playerId, true);
      setTimeout(() => {
        useChatStore.getState().setTyping(playerId, false);
      }, 3000);
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
    socket.on('player:stayed', onStayed);
    socket.on('player:frozen', onFrozen);
    socket.on('player:flip7', onFlip7);
    socket.on('turn:changed', onTurnChanged);
    socket.on('game:ended', onGameEnd);
    socket.on('round:ended', onRoundEnd);
    socket.on('game:started', onGameStarted);
    socket.on('game:reset', onGameReset);
    socket.on('player:disconnected', onDisconnected);
    socket.on('player:reconnected', onReconnected);
    socket.on('chat:message', onChatMessage);
    socket.on('chat:typing', onTyping);

    return () => {
      socket.off('connect', onConnect);
      socket.off('room:state', onState);
      socket.off('card:dealt', onCardDealt);
      socket.off('error', onError);
      socket.off('player:busted', onBusted);
      socket.off('player:stayed', onStayed);
      socket.off('player:frozen', onFrozen);
      socket.off('player:flip7', onFlip7);
      socket.off('turn:changed', onTurnChanged);
      socket.off('game:ended', onGameEnd);
      socket.off('round:ended', onRoundEnd);
      socket.off('game:started', onGameStarted);
      socket.off('game:reset', onGameReset);
      socket.off('player:disconnected', onDisconnected);
      socket.off('player:reconnected', onReconnected);
      socket.off('chat:message', onChatMessage);
      socket.off('chat:typing', onTyping);
    };
  }, [setRoom, setLastDealt, addFeedback, addChatMessage, navigate]);
}
