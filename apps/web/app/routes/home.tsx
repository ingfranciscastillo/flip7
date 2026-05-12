import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { getSocket } from '../lib/socket';
import { useIdentity } from '../store/gameStore';
import { AvatarSelector } from '../components/AvatarSelector';

type RoomCreateResponse =
  | { ok: true; roomCode: string; playerId: string }
  | { ok: false; error: string };
type RoomJoinResponse =
  | { ok: true; playerId: string }
  | { ok: false; error: string };

export default function Home() {
  const navigate = useNavigate();
  const profile = useIdentity();
  const [name, setName] = useState(profile.name || '');
  const [emoji, setEmoji] = useState('');
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
    getSocket().emit(
      'room:create',
      { name: n, emoji },
      (res: RoomCreateResponse) => {
        setLoading(false);
        if (!res.ok) return toast.error(res.error);
        profile.setIdentity({ playerId: res.playerId, roomCode: res.roomCode });
        navigate(`/lobby/${res.roomCode}`);
      },
    );
  };

  const join = () => {
    const n = ensureProfile();
    if (!n) return;
    const c = code.trim().toUpperCase();
    if (c.length !== 6) return toast.error('Código inválido');
    setLoading(true);
    getSocket().emit(
      'room:join',
      { code: c, name: n, emoji },
      (res: RoomJoinResponse) => {
        setLoading(false);
        if (!res.ok) return toast.error(res.error);
        profile.setIdentity({ playerId: res.playerId, roomCode: c });
        navigate(`/lobby/${c}`);
      },
    );
  };

  useEffect(() => {
    if (profile?.emoji) {
      setEmoji(profile.emoji);
    }
  }, [profile?.emoji]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <nav className="w-full flex items-center justify-end px-6 py-4">
        <Link
          to="/how-to-play"
          className="text-sm text-primary hover:text-primary transition font-body"
        >
          ¿Cómo jugar?
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        <div className="text-center">
          <h2 className="font-display text-6xl font-black text-primary tracking-wide">
            Flip 7
          </h2>
          <p className="text-sm mt-1 font-mono tracking-wider">
            Card multiplayer Game
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md card-surface p-8 space-y-8"
        >
          <div className="space-y-4">
            <label className="text-sm text-muted">Tu nombre</label>
            <input
              className="input mt-2"
              placeholder="Tu nombre"
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm text-muted">Avatar</label>
            <AvatarSelector value={emoji} onChange={setEmoji} />
          </div>

          <button
            className="btn-primary w-full"
            disabled={loading}
            onClick={create}
          >
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
    </div>
  );
}
