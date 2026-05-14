import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socket';
import { motion } from 'motion/react';

export function ConnectionStatus({ minimal = false }: { minimal?: boolean }) {
  const [status, setStatus] = useState<
    'connected' | 'connecting' | 'disconnected'
  >('disconnected');

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('connecting');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) {
      setStatus('connected');
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const getIndicator = () => {
    if (status === 'connected') {
      return (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]"
        />
      );
    }
    return (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
      </span>
    );
  };

  if (minimal) {
    return getIndicator();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pill bg-surface/95 border border-border shadow-lg"
    >
      {getIndicator()}
      <span className="text-muted">
        {status === 'connected' ? 'Conectado' : 'Conectando...'}
      </span>
    </motion.div>
  );
}
