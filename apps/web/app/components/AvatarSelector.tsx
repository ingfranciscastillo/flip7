import { memo } from 'react';

const EMOJIS = [
  '🦊',
  '🐼',
  '🐻‍❄️',
  '🐸',
  '🦁',
  '🐙',
  '🤖',
  '🐥',
  '🐵',
  '🐯',
  '🐨',
  '🐶',
] as const;

interface AvatarButtonProps {
  emoji: string;
  isSelected: boolean;
  onClick: () => void;
}

const AvatarButton = memo(function AvatarButton({
  emoji,
  isSelected,
  onClick,
}: AvatarButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-selected={isSelected}
      aria-label={`Avatar ${emoji}`}
      className={`
        aspect-square rounded-xl text-2xl border transition-all duration-200
        ${
          isSelected
            ? 'border-primary bg-primary/10 scale-105 shadow-md ring-2 ring-primary/30'
            : 'border-border bg-surface2 hover:border-primary/50 hover:scale-105'
        }
      `}
    >
      {emoji}
    </button>
  );
});

interface AvatarSelectorProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function AvatarSelector({ value, onChange }: AvatarSelectorProps) {
  return (
    <div
      role="listbox"
      aria-label="Seleccionar avatar"
      className="grid grid-cols-6 gap-2 mt-2"
      suppressHydrationWarning
    >
      {EMOJIS.map((emoji) => (
        <AvatarButton
          key={emoji}
          emoji={emoji}
          isSelected={value === emoji}
          onClick={() => onChange(emoji)}
        />
      ))}
    </div>
  );
}

export { EMOJIS };
