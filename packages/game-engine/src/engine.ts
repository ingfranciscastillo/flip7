import type { Card, PlayerPublic, RoomState, RoomPhase } from '@flip7/shared';
import { buildDeck, shuffle } from './deck';
import {
  FLIP7_BONUS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  TARGET_SCORE,
  isNumberCard,
  reachedFlip7,
} from './rules';
import { scoreHand } from './score';

export type EngineEvent =
  | { type: 'card_dealt'; playerId: string; card: Card }
  | { type: 'busted'; playerId: string }
  | { type: 'stayed'; playerId: string }
  | { type: 'frozen'; playerId: string }
  | { type: 'flip7'; playerId: string }
  | { type: 'turn_changed'; playerId: string }
  | { type: 'round_ended'; round: number; scores: Record<string, number> }
  | { type: 'game_ended'; winnerId: string }
  | {
      type: 'pending_target';
      sourcePlayerId: string;
      cardId: string;
      action: 'freeze' | 'flip3';
    };

export interface PlayerInternal {
  id: string;
  name: string;
  emoji: string;
  isHost: boolean;
  connected: boolean;
  previousStatus: PlayerPublic['status'] | null;
  totalScore: number;
  hand: Card[];
  status: PlayerPublic['status'];
  hasSecondChance: boolean;
  pendingFlips: number;
}

export interface PendingTarget {
  sourcePlayerId: string;
  cardId: string;
  action: 'freeze' | 'flip3';
}

export class GameEngine {
  code: string;
  phase: RoomPhase = 'lobby';
  players: PlayerInternal[] = [];
  hostId = '';
  deck: Card[] = [];
  discard: Card[] = [];
  currentTurnIndex = 0;
  round = 0;
  winnerId: string | null = null;
  pendingTarget: PendingTarget | null = null;
  private rng: () => number;

  constructor(code: string, rng: () => number = Math.random) {
    this.code = code;
    this.rng = rng;
  }

  // -------- Lobby --------
  addPlayer(p: { id: string; name: string; emoji: string }): {
    ok: boolean;
    error?: string;
  } {
    if (this.phase !== 'lobby')
      return { ok: false, error: 'Game already started' };
    if (this.players.length >= MAX_PLAYERS)
      return { ok: false, error: 'Room full' };
    if (this.players.some((x) => x.id === p.id)) return { ok: true };
    const isHost = this.players.length === 0;
    this.players.push({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      isHost,
      connected: true,
      previousStatus: null,
      totalScore: 0,
      hand: [],
      status: 'active',
      hasSecondChance: false,
      pendingFlips: 0,
    });
    if (isHost) this.hostId = p.id;
    return { ok: true };
  }

  removePlayer(playerId: string) {
    this.players = this.players.filter((p) => p.id !== playerId);
    if (this.hostId === playerId && this.players.length > 0) {
      this.players[0]!.isHost = true;
      this.hostId = this.players[0]!.id;
    }
  }

  setConnected(playerId: string, connected: boolean) {
    const p = this.players.find((x) => x.id === playerId);
    if (!p) return;

    if (!connected && this.phase === 'playing') {
      // Guardar estado previo si estaba activo
      if (p.status === 'active') {
        p.previousStatus = 'active';
      }
      p.connected = false;
      // Solo marcar como desconectado si no estaba en estado terminal
      if (p.status === 'active') {
        p.status = 'disconnected';
      }
    } else if (connected && p.status === 'disconnected') {
      // Restaurar al estado previo
      p.status = p.previousStatus ?? 'active';
      p.previousStatus = null;
      p.connected = true;
    } else {
      p.connected = connected;
    }
  }

  // -------- Round / Game --------
  startGame(byPlayerId: string): { ok: boolean; error?: string } {
    if (byPlayerId !== this.hostId)
      return { ok: false, error: 'Only host can start' };
    if (this.phase !== 'lobby') return { ok: false, error: 'Already started' };
    if (this.players.length < MIN_PLAYERS)
      return { ok: false, error: `Need ${MIN_PLAYERS}+ players` };
    this.startRound();
    return { ok: true };
  }

  resetGame(byPlayerId: string): { ok: boolean; error?: string } {
    if (byPlayerId !== this.hostId)
      return { ok: false, error: 'Only host can reset' };
    this.phase = 'lobby';
    this.winnerId = null;
    this.round = 0;
    this.deck = [];
    this.discard = [];
    this.pendingTarget = null;
    this.currentTurnIndex = 0;
    for (const p of this.players) {
      p.totalScore = 0;
      p.hand = [];
      p.status = 'active';
      p.hasSecondChance = false;
      p.pendingFlips = 0;
    }
    return { ok: true };
  }

  private startRound() {
    this.round += 1;
    this.phase = 'playing';
    this.deck = shuffle(buildDeck(), this.rng);
    this.discard = [];
    this.pendingTarget = null;
    for (const p of this.players) {
      p.hand = [];
      p.status = 'active';
      p.hasSecondChance = false;
      p.pendingFlips = 0;
    }
    // Start at first non-disconnected player
    this.currentTurnIndex = 0;
    this.advanceToNextActive(true);
  }

  private drawCard(): Card | null {
    if (this.deck.length === 0) {
      // reshuffle discard
      if (this.discard.length === 0) return null;
      this.deck = shuffle(this.discard, this.rng);
      this.discard = [];
    }
    return this.deck.pop() ?? null;
  }

  // Returns granular events for the current action
  hit(playerId: string): EngineEvent[] {
    const events: EngineEvent[] = [];
    if (this.phase !== 'playing') return events;
    const p = this.currentPlayer();
    if (!p || p.id !== playerId) return events;
    if (p.pendingFlips > 0) return events; // auto-flips handled separately
    events.push(...this.dealOneTo(p));
    if (p.status === 'active') {
      // turn continues for same player after a hit; player decides hit/stay again
      // unless an action card requires target — handled in dealOneTo
    } else {
      events.push(...this.advanceTurn());
    }
    events.push(...this.checkRoundEnd());
    return events;
  }

  stay(playerId: string): EngineEvent[] {
    const events: EngineEvent[] = [];
    if (this.phase !== 'playing') return events;
    const p = this.currentPlayer();
    if (!p || p.id !== playerId) return events;
    if (p.pendingFlips > 0) return events;
    p.status = 'stayed';
    events.push({ type: 'stayed', playerId: p.id });
    events.push(...this.advanceTurn());
    events.push(...this.checkRoundEnd());
    return events;
  }

  /** Resolve a pending action target (freeze / flip3) */
  applyTarget(
    sourceId: string,
    cardId: string,
    targetId: string,
  ): EngineEvent[] {
    const events: EngineEvent[] = [];
    if (!this.pendingTarget) return events;
    if (
      this.pendingTarget.sourcePlayerId !== sourceId ||
      this.pendingTarget.cardId !== cardId
    )
      return events;
    const target = this.players.find((p) => p.id === targetId);
    if (!target) return events;
    // Target must be still in round (active or stayed counts as still in? In Flip7,
    // freeze/flip3 only target players still active in this round).
    if (target.status !== 'active') return events;
    const action = this.pendingTarget.action;
    this.pendingTarget = null;

    if (action === 'freeze') {
      target.status = 'frozen';
      events.push({ type: 'frozen', playerId: target.id });
    } else {
      target.pendingFlips = 3;
      events.push(...this.resolvePendingFlips(target));
    }
    // After resolving the action, the source player's turn ended (action used).
    // If source was the current player, advance.
    const cur = this.currentPlayer();
    if (cur?.id === sourceId) {
      // The source could have already changed status (e.g. flip3 to self busted)
      events.push(...this.advanceTurn());
    }
    events.push(...this.checkRoundEnd());
    return events;
  }

  private resolvePendingFlips(p: PlayerInternal): EngineEvent[] {
    const events: EngineEvent[] = [];
    while (p.pendingFlips > 0 && p.status === 'active') {
      p.pendingFlips -= 1;
      events.push(...this.dealOneTo(p));
    }
    p.pendingFlips = 0;
    return events;
  }

  private dealOneTo(p: PlayerInternal): EngineEvent[] {
    const events: EngineEvent[] = [];
    const card = this.drawCard();
    if (!card) {
      // deck exhausted: end round
      this.endRound(events);
      return events;
    }
    events.push({ type: 'card_dealt', playerId: p.id, card });

    if (card.kind === 'number') {
      const dup = p.hand.some(
        (c) => c.kind === 'number' && c.value === card.value,
      );
      if (dup) {
        if (p.hasSecondChance) {
          p.hasSecondChance = false;
          // discard duplicate + the second chance, hand keeps existing
          this.discard.push(card);
          // also remove SC from hand
          const idx = p.hand.findIndex(
            (c) => c.kind === 'action' && c.action === 'second_chance',
          );
          if (idx >= 0) {
            const [sc] = p.hand.splice(idx, 1);
            if (sc) this.discard.push(sc);
          }
        } else {
          p.status = 'busted';
          // discard everything in hand + drawn card
          this.discard.push(...p.hand, card);
          p.hand = [];
          events.push({ type: 'busted', playerId: p.id });
          return events;
        }
      } else {
        p.hand.push(card);
        if (reachedFlip7(p.hand)) {
          p.status = 'flip7';
          events.push({ type: 'flip7', playerId: p.id });
        }
      }
    } else if (card.kind === 'modifier') {
      p.hand.push(card);
    } else {
      // action
      if (card.action === 'second_chance') {
        if (p.hasSecondChance) {
          // duplicate SC → must give to another active player; for simplicity discard
          this.discard.push(card);
        } else {
          p.hasSecondChance = true;
          p.hand.push(card);
        }
      } else {
        // freeze / flip3 → require target. Can target self.
        // If only one active player remains (self), auto-target self
        const activeCount = this.players.filter(
          (x) => x.status === 'active',
        ).length;
        if (activeCount <= 1) {
          // target self
          this.discard.push(card);
          if (card.action === 'freeze') {
            p.status = 'frozen';
            events.push({ type: 'frozen', playerId: p.id });
          } else {
            p.pendingFlips = 3;
            events.push(...this.resolvePendingFlips(p));
          }
        } else {
          this.pendingTarget = {
            sourcePlayerId: p.id,
            cardId: card.id,
            action: card.action,
          };
          this.discard.push(card);
          events.push({
            type: 'pending_target',
            sourcePlayerId: p.id,
            cardId: card.id,
            action: card.action,
          });
        }
      }
    }
    return events;
  }

  private currentPlayer(): PlayerInternal | undefined {
    return this.players[this.currentTurnIndex];
  }

  private advanceToNextActive(emit = false): EngineEvent[] {
    const events: EngineEvent[] = [];
    const n = this.players.length;
    if (n === 0) return events;
    for (let step = 0; step < n; step++) {
      const idx = (this.currentTurnIndex + step) % n;
      const p = this.players[idx]!;
      if (p.status === 'active') {
        this.currentTurnIndex = idx;
        if (emit) events.push({ type: 'turn_changed', playerId: p.id });
        return events;
      }
    }
    return events;
  }

  private advanceTurn(): EngineEvent[] {
    if (this.pendingTarget) return [];
    const n = this.players.length;
    for (let step = 1; step <= n; step++) {
      const idx = (this.currentTurnIndex + step) % n;
      const p = this.players[idx]!;
      if (p.status === 'active') {
        this.currentTurnIndex = idx;
        return [{ type: 'turn_changed', playerId: p.id }];
      }
    }
    return [];
  }

  private checkRoundEnd(): EngineEvent[] {
    if (this.phase !== 'playing') return [];
    const stillPlaying = this.players.some((p) => p.status === 'active');
    const flip7 = this.players.some((p) => p.status === 'flip7');
    if (!stillPlaying || flip7) {
      const events: EngineEvent[] = [];
      this.endRound(events);
      return events;
    }
    return [];
  }

  private endRound(events: EngineEvent[]) {
    const scores: Record<string, number> = {};
    for (const p of this.players) {
      const busted = p.status === 'busted';
      const rs = scoreHand(p.hand, busted);
      scores[p.id] = rs;
      p.totalScore += rs;
    }
    this.phase = 'round_end';
    events.push({ type: 'round_ended', round: this.round, scores });

    // game-end check
    const winner = [...this.players].sort(
      (a, b) => b.totalScore - a.totalScore,
    )[0];
    if (winner && winner.totalScore >= TARGET_SCORE) {
      this.phase = 'game_end';
      this.winnerId = winner.id;
      events.push({ type: 'game_ended', winnerId: winner.id });
    }
  }

  /** Host advances to the next round after a round_end. */
  nextRound(byPlayerId: string): EngineEvent[] {
    if (byPlayerId !== this.hostId) return [];
    if (this.phase !== 'round_end') return [];
    this.startRound();
    const cur = this.currentPlayer();
    return cur ? [{ type: 'turn_changed', playerId: cur.id }] : [];
  }

  // -------- Public snapshot --------
  toRoomState(): RoomState {
    const cur = this.currentPlayer();
    return {
      code: this.code,
      phase: this.phase,
      hostId: this.hostId,
      currentTurnPlayerId: cur?.id ?? null,
      deckCount: this.deck.length,
      discardCount: this.discard.length,
      round: this.round,
      winnerId: this.winnerId,
      pendingTarget: this.pendingTarget,
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        emoji: p.emoji,
        isHost: p.isHost,
        connected: p.connected,
        totalScore: p.totalScore,
        hand: p.hand,
        status: p.status,
        hasSecondChance: p.hasSecondChance,
        pendingFlips: p.pendingFlips,
      })),
    };
  }
}

export { FLIP7_BONUS, TARGET_SCORE, MIN_PLAYERS, MAX_PLAYERS, isNumberCard };
