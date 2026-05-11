import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { getSocket } from '../lib/socket';
import { useIdentity } from '../store/gameStore';

type RoomCreateResponse =
  | { ok: true; roomCode: string; playerId: string }
  | { ok: false; error: string };
type RoomJoinResponse = { ok: true; playerId: string } | { ok: false; error: string };

const EMOJIS = ['🦊', '🐼', '🐧', '🐸', '🦁', '🐙', '🦄', '🐲', '🐵', '🐯', '🐨', '🦉'];

export default function Home() {
  const navigate = useNavigate();
  const profile = useIdentity();
  const [name, setName] = useState(profile.name || '');
  const [emoji, setEmoji] = useState(profile.emoji || '🦊');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const ensureProfile = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Pon tu nombre');
      return null;
    }
    profile.setProfile({ name: trimmed, emoji });
    return trimmed;
  };

  const create = () => {
    const n = ensureProfile();
    if (!n) return;
    setLoading(true);
    getSocket().emit('room:create', { name: n, emoji }, (res: RoomCreateResponse) => {
      setLoading(false);
      if (!res.ok) return toast.error(res.error);
      profile.setIdentity({ playerId: res.playerId, roomCode: res.roomCode });
      navigate(`/lobby/${res.roomCode}`);
    });
  };

  const join = () => {
    const n = ensureProfile();
    if (!n) return;
    const c = code.trim().toUpperCase();
    if (c.length !== 6) return toast.error('Código inválido');
    setLoading(true);
    getSocket().emit('room:join', { code: c, name: n, emoji }, (res: RoomJoinResponse) => {
      setLoading(false);
      if (!res.ok) return toast.error(res.error);
      profile.setIdentity({ playerId: res.playerId, roomCode: c });
      navigate(`/lobby/${c}`);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md card-surface p-6 space-y-5"
      >
        <div className="text-center">
          <h1 className="text-4xl font-black bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            Flip 7
          </h1>
          <p className="text-sm text-muted mt-1">Multijugador en tiempo real</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted">Tu nombre</label>
          <input
            className="input"
            placeholder="Tu nombre"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted">Avatar</label>
          <div className="grid grid-cols-6 gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`aspect-square rounded-xl text-2xl border transition ${
                  emoji === e ? 'border-primary bg-primary/10' : 'border-border bg-surface2'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary w-full" disabled={loading} onClick={create}>
          Crear sala
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs text-muted">o únete</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <div className="flex gap-2">
          <input
            className="input uppercase tracking-widest font-bold"
            placeholder="CÓDIGO"
            value={code}
            maxLength={6}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <button className="btn-ghost" disabled={loading} onClick={join}>
            Entrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
