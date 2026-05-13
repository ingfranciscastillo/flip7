import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { useChatStore } from '../store/chatStore';
import { useIdentity } from '../store/gameStore';
import { getSocket } from '../lib/socket';

interface Props {
  roomCode: string;
}

export function ChatBox({ roomCode }: Props) {
  const messages = useChatStore((s) => s.messages);
  const isOpen = useChatStore((s) => s.isOpen);
  const toggleOpen = useChatStore((s) => s.toggleOpen);
  const addMessage = useChatStore((s) => s.addMessage);
  const me = useIdentity();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    getSocket().emit(
      'chat:message',
      { roomCode, message: trimmed },
      (res: { ok: true } | { ok: false; error: string }) => {
        setIsSending(false);
        if (!res.ok) return;
        setInput('');
        inputRef.current?.focus();
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        className={clsx(
          'fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors',
          isOpen
            ? 'bg-primary text-white'
            : 'bg-surface2 text-muted hover:bg-primary hover:text-white',
        )}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
      >
        {isOpen ? (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <div className="relative">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {messages.length > 0 && !isOpen && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
            )}
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-32 right-4 z-40 w-80 max-h-96 bg-surface rounded-2xl shadow-xl flex flex-col overflow-hidden border border-white/10"
          >
            <div className="p-3 bg-surface2 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Chat de sala</h3>
              <span className="text-xs text-muted">
                {messages.length} mensajes
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-64">
              {messages.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">
                  No hay mensajes aún. ¡Sé el primero!
                </p>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.playerId === me.playerId;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={clsx(
                        'flex flex-col',
                        isMe ? 'items-end' : 'items-start',
                      )}
                    >
                      <div
                        className={clsx(
                          'flex items-center gap-1.5 text-xs text-muted',
                        )}
                      >
                        <span>{msg.emoji}</span>
                        <span className="font-medium">{msg.playerName}</span>
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>
                      <div
                        className={clsx(
                          'mt-1 px-3 py-2 rounded-xl text-sm max-w-[85%]',
                          isMe
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-surface2 text-ink rounded-bl-sm',
                        )}
                      >
                        {msg.message}
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="p-3 border-t border-white/5 flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 200))}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-surface2 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted/50"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  input.trim() && !isSending
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-surface2 text-muted/50 cursor-not-allowed',
                )}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
