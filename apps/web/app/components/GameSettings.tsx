import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GameSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: { turnTimeLimit: number }) => void;
}

const TIME_OPTIONS = [
  { value: 0, label: 'Sin límite' },
  { value: 10000, label: '10 segundos' },
  { value: 20000, label: '20 segundos' },
  { value: 30000, label: '30 segundos' },
];

export function GameSettings({ isOpen, onClose, onStart }: GameSettingsProps) {
  const [turnTimeLimit, setTurnTimeLimit] = useState(0);

  const handleStart = () => {
    onStart({
      turnTimeLimit,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="card-surface p-6 w-full max-w-sm space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h2 className="text-xl font-bold">Configuración</h2>
              <p className="text-sm text-muted">Personaliza la partida</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted">
                  Tiempo por turno
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {TIME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`pill ${
                        turnTimeLimit === opt.value
                          ? 'bg-primary text-white'
                          : 'bg-surface2 text-muted'
                      }`}
                      onClick={() => setTurnTimeLimit(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn-primary flex-1" onClick={handleStart}>
                Iniciar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
