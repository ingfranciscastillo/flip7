import { z } from 'zod';

// ----- Cards -----
export const NumberCardSchema = z.object({
  kind: z.literal('number'),
  value: z.number().int().min(0).max(12),
  id: z.string(),
});
export const ModifierCardSchema = z.object({
  kind: z.literal('modifier'),
  modifier: z.union([
    z.literal('+2'),
    z.literal('+4'),
    z.literal('+6'),
    z.literal('+8'),
    z.literal('+10'),
    z.literal('x2'),
  ]),
  id: z.string(),
});
export const ActionCardSchema = z.object({
  kind: z.literal('action'),
  action: z.union([
    z.literal('freeze'),
    z.literal('flip3'),
    z.literal('second_chance'),
  ]),
  id: z.string(),
});
export const CardSchema = z.discriminatedUnion('kind', [
  NumberCardSchema,
  ModifierCardSchema,
  ActionCardSchema,
]);
export type NumberCard = z.infer<typeof NumberCardSchema>;
export type ModifierCard = z.infer<typeof ModifierCardSchema>;
export type ActionCard = z.infer<typeof ActionCardSchema>;
export type Card = z.infer<typeof CardSchema>;

// ----- Player -----
export const PlayerStatusSchema = z.union([
  z.literal('active'),
  z.literal('stayed'),
  z.literal('busted'),
  z.literal('frozen'),
  z.literal('flip7'),
  z.literal('disconnected'),
]);
export type PlayerStatus = z.infer<typeof PlayerStatusSchema>;

export const PlayerPublicSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(20),
  emoji: z.string().min(1).max(8),
  isHost: z.boolean(),
  connected: z.boolean(),
  totalScore: z.number().int(),
  // Round-only:
  hand: z.array(CardSchema),
  status: PlayerStatusSchema,
  hasSecondChance: z.boolean(),
  pendingFlips: z.number().int().min(0), // remaining auto-flips from Flip3
});
export type PlayerPublic = z.infer<typeof PlayerPublicSchema>;

// ----- Room -----
export const RoomPhaseSchema = z.union([
  z.literal('lobby'),
  z.literal('playing'),
  z.literal('round_end'),
  z.literal('game_end'),
]);
export type RoomPhase = z.infer<typeof RoomPhaseSchema>;

export const RoomStateSchema = z.object({
  code: z.string().length(6),
  phase: RoomPhaseSchema,
  players: z.array(PlayerPublicSchema),
  hostId: z.string(),
  currentTurnPlayerId: z.string().nullable(),
  deckCount: z.number().int(),
  discardCount: z.number().int(),
  round: z.number().int(),
  winnerId: z.string().nullable(),
  // For "select target" UX:
  pendingTarget: z
    .object({
      sourcePlayerId: z.string(),
      cardId: z.string(),
      action: z.union([z.literal('freeze'), z.literal('flip3')]),
    })
    .nullable(),
});
export type RoomState = z.infer<typeof RoomStateSchema>;

// ----- Client -> Server -----
export const RoomCreateSchema = z.object({
  name: z.string().min(1).max(20),
  emoji: z.string().min(1).max(8),
});
export const RoomJoinSchema = z.object({
  code: z.string().length(6),
  name: z.string().min(1).max(20),
  emoji: z.string().min(1).max(8),
});
export const RoomRejoinSchema = z.object({
  code: z.string().length(6),
  playerId: z.string(),
});
export const CardTargetSchema = z.object({
  cardId: z.string(),
  targetPlayerId: z.string(),
});

// ----- Server -> Client -----
export const ErrorPayloadSchema = z.object({
  code: z.string(),
  message: z.string(),
});

// Strongly-typed event maps (used by socket.io typed clients)
export interface ClientToServerEvents {
  'room:create': (
    payload: z.infer<typeof RoomCreateSchema>,
    ack: (
      res:
        | { ok: true; roomCode: string; playerId: string }
        | { ok: false; error: string },
    ) => void,
  ) => void;
  'room:join': (
    payload: z.infer<typeof RoomJoinSchema>,
    ack: (
      res: { ok: true; playerId: string } | { ok: false; error: string },
    ) => void,
  ) => void;
  'room:rejoin': (
    payload: z.infer<typeof RoomRejoinSchema>,
    ack: (res: { ok: true } | { ok: false; error: string }) => void,
  ) => void;
  'room:leave': () => void;
  'game:start': () => void;
  'game:reset': () => void;
  'turn:hit': () => void;
  'turn:stay': () => void;
  'card:target': (payload: z.infer<typeof CardTargetSchema>) => void;
}

export interface ServerToClientEvents {
  'room:state': (state: RoomState) => void;
  'game:started': () => void;
  'game:reset': () => void;
  'turn:changed': (playerId: string) => void;
  'card:dealt': (data: { playerId: string; card: Card }) => void;
  'player:busted': (playerId: string) => void;
  'player:stayed': (playerId: string) => void;
  'player:frozen': (playerId: string) => void;
  'player:flip7': (playerId: string) => void;
  'round:ended': (summary: {
    round: number;
    scores: Record<string, number>;
  }) => void;
  'game:ended': (winnerId: string) => void;
  'player:disconnected': (playerId: string) => void;
  'player:reconnected': (playerId: string) => void;
  error: (payload: z.infer<typeof ErrorPayloadSchema>) => void;
  'card:target-required': (data: {
    sourcePlayerId: string;
    cardId: string;
    action: 'freeze' | 'flip3';
  }) => void;
}
