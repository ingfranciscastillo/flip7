import { Link } from 'react-router';
import { motion } from 'motion/react';

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-surface2 border border-border rounded-xl px-4 py-2 text-center">
      <div className="text-2xl font-black text-primary">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function RuleSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-6 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-xl font-display">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function QuickCard({
  icon,
  title,
  desc,
  color = 'primary',
}: {
  icon: string;
  title: string;
  desc: string;
  color?: string;
}) {
  return (
    <div className="bg-surface2 border border-border rounded-xl p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div
        className={`font-bold text-lg ${color === 'success' ? 'text-success' : color === 'danger' ? 'text-danger' : color === 'gold' ? 'text-gold' : 'text-primary'}`}
      >
        {title}
      </div>
      <div className="text-sm text-muted">{desc}</div>
    </div>
  );
}

function ActionCard({
  icon,
  name,
  desc,
  effect,
}: {
  icon: string;
  name: string;
  desc: string;
  effect: React.ReactNode;
}) {
  return (
    <div className="bg-surface2 border border-border rounded-xl p-4 flex gap-4">
      <div className="text-4xl">{icon}</div>
      <div className="flex-1">
        <div className="font-bold text-lg text-primary mb-1">{name}</div>
        <div className="text-sm text-muted mb-2">{desc}</div>
        <div className="bg-surface rounded-lg p-2 text-sm">{effect}</div>
      </div>
    </div>
  );
}

function StrategyItem({
  tip,
}: {
  tip: { icon: string; title: string; desc: string };
}) {
  return (
    <div className="flex gap-3">
      <span className="text-2xl">{tip.icon}</span>
      <div>
        <div className="font-semibold">{tip.title}</div>
        <div className="text-sm text-muted">{tip.desc}</div>
      </div>
    </div>
  );
}

const deckDistribution = [
  { num: 0, count: 1 },
  { num: 1, count: 2 },
  { num: 2, count: 3 },
  { num: 3, count: 4 },
  { num: 4, count: 5 },
  { num: 5, count: 6 },
  { num: 6, count: 7 },
  { num: 7, count: 8 },
  { num: 8, count: 9 },
  { num: 9, count: 10 },
  { num: 10, count: 11 },
  { num: 11, count: 12 },
  { num: 12, count: 13 },
];

const strategies = [
  {
    icon: '⏸️',
    title: 'Saber cuándo quedarse',
    desc: 'Con 20+ puntos y cartas altas (10, 11, 12), considera hacer Stay. Estas cartas tienen más duplicados.',
  },
  {
    icon: '🔢',
    title: 'Cartas bajas son más seguras',
    desc: 'Las cartas 0-3 solo tienen 1-3 copias. Si tu mano tiene solo cartas bajas, puedes arriesgar más.',
  },
  {
    icon: '✖️',
    title: 'Protege tu multiplicador',
    desc: 'Si tienes x2, no apuestas tu puntuación. 15 puntos x2 = 30 puntos. ¡Eso es excelente!',
  },
  {
    icon: '👀',
    title: 'Observa la mesa',
    desc: 'Si ya salieron varios de un número, tener ese número es más seguro.',
  },
  {
    icon: '🎯',
    title: 'Usa las acciones estratégicamente',
    desc: 'Congela oponentes con buenas puntuaciones. Usa Flip 3 en jugadores con cartas peligrosas.',
  },
];

const mistakes = [
  {
    icon: '❌',
    title: 'Perseguir siempre el Flip 7',
    desc: 'El bonus de 15 puntos es tentador, pero si ya tienes cartas altas, puede llevar a busting.',
  },
  {
    icon: '❌',
    title: 'Ignorar el valor del x2',
    desc: 'Jugadores se quedan hitteando después de x2. Un seguro 30 puntos > busted 0 puntos.',
  },
  {
    icon: '❌',
    title: 'Usar Second Chance muy temprano',
    desc: 'Guarda tu Second Chance para cuando tengas una mano que valga la pena proteger.',
  },
  {
    icon: '❌',
    title: 'No adaptar al estado del juego',
    desc: 'Si vas primero, juega conservador. Si vas atrás, toma más riesgos.',
  },
];

export default function HowToPlay() {
  return (
    <div className="min-h-screen pb-20">
      <div className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted hover:text-ink transition"
          >
            <span className="text-xl">←</span>
            <span>Volver</span>
          </Link>
          <h1 className="font-display text-xl">Cómo Jugar</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface p-6 text-center"
        >
          <h2 className="text-3xl font-display mb-4">🎯 Objetivo</h2>
          <p className="text-muted mb-6 font-body">
            Sé el primer jugador en alcanzar{' '}
            <span className="text-primary font-bold text-xl">200 puntos</span>{' '}
            para ganar.
          </p>
          <div className="flex justify-center gap-4">
            <StatBadge value="200" label="puntos para ganar" />
            <StatBadge value="94" label="cartas en el mazo" />
            <StatBadge value="3+" label="jugadores mínimo" />
          </div>
        </motion.div>

        <RuleSection title="Resumen Rápido" icon="📋">
          <div className="grid grid-cols-2 gap-3">
            <QuickCard
              icon="📥"
              title="Hit"
              desc="Recibe otra carta"
              color="primary"
            />
            <QuickCard
              icon="✋"
              title="Stay"
              desc="Guarda tus puntos"
              color="success"
            />
            <QuickCard
              icon="💥"
              title="Bust"
              desc="0 puntos para la ronda"
              color="danger"
            />
            <QuickCard
              icon="🎲"
              title="Flip 7"
              desc="+15 puntos bonus"
              color="gold"
            />
          </div>
        </RuleSection>

        <RuleSection title="El Mazo" icon="🃏">
          <p className="text-muted text-sm">
            El mazo de Flip 7 tiene{' '}
            <span className="text-primary font-bold">94 cartas</span>:
          </p>
          <div className="grid grid-cols-7 gap-2">
            {deckDistribution.map((d) => (
              <div
                key={d.num}
                className="bg-surface2 border border-border rounded-lg p-2 text-center"
              >
                <div className="text-lg font-bold">{d.num}</div>
                <div className="text-xs text-muted">×{d.count}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted bg-surface p-2 rounded-lg">
            💡 El <span className="text-primary">0</span> vale 0 puntos pero
            aumenta tus chances de lograr Flip 7.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full">
              3 Cartas de Acción × 3 = 9
            </span>
            <span className="bg-accent/20 text-accent px-3 py-1 rounded-full">
              Modificadores (x2, +2, +4, +6, +8, +10)
            </span>
          </div>
        </RuleSection>

        <RuleSection title="Tu Turno" icon="🔄">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <div className="font-semibold">Elige: Hit o Stay</div>
                <div className="text-sm text-muted">
                  Cada jugador recibe una carta inicial. Luego, en tu turno,
                  puedes pedir otra carta (Hit) o guardarte tus puntos (Stay).
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <div className="font-semibold">Organiza tus cartas</div>
                <div className="text-sm text-muted">
                  Las cartas numéricas van en fila. Los modificadores van encima
                  de la carta que modifican.
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <div className="font-semibold">Regla del Stay</div>
                <div className="text-sm text-muted">
                  Puedes hacer Stay siempre y cuando tengas al menos una carta
                  frente a ti.
                </div>
              </div>
            </div>
          </div>
        </RuleSection>

        <RuleSection title="Cartas de Acción" icon="⚡">
          <p className="text-sm text-muted">
            Las cartas de acción pueden jugarse sobre cualquier jugador activo,
            incluyéndote a ti mismo.
          </p>
          <div className="space-y-3">
            <ActionCard
              icon="❄️"
              name="Freeze!"
              desc="El jugador recibe esta carta y se congela."
              effect={<>Banca todos sus puntos y queda fuera de la ronda. 🔒</>}
            />
            <ActionCard
              icon="🔁"
              name="Flip Three!"
              desc="El jugador debe tomar las próximas 3 cartas."
              effect={<>Se detén temprano si logra Flip 7 o si hace bust. ⏭️</>}
            />
            <ActionCard
              icon="🛡️"
              name="Second Chance!"
              desc="Conservala. Si sacas un duplicado, descártala junto al duplicado."
              effect={
                <>¡Te salva del bust! Solo puedes tener una a la vez. ⚠️</>
              }
            />
          </div>
        </RuleSection>

        <RuleSection title="Cartas Modificadoras" icon="✨">
          <p className="text-sm text-muted">
            Los modificadores <span className="text-danger">NO</span> cuentan
            para el bonus de Flip 7. No puedes hacer bust con modificadores.
          </p>
          <div className="space-y-3">
            <div className="bg-surface2 border border-border rounded-xl p-4">
              <div className="font-semibold mb-2">+2 a +10</div>
              <div className="flex flex-wrap gap-2">
                {['+2', '+4', '+6', '+8', '+10'].map((m) => (
                  <span
                    key={m}
                    className="bg-accent/20 text-accent px-3 py-1 rounded-lg font-bold"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <div className="text-sm text-muted mt-2">
                Suman su valor después de calcular tu puntuación base.
              </div>
            </div>
            <div className="bg-surface2 border border-border rounded-xl p-4">
              <div className="font-semibold mb-2">×2 Multiplicador</div>
              <span className="bg-gold/20 text-gold px-3 py-1 rounded-lg font-bold text-xl">
                ×2
              </span>
              <div className="text-sm text-muted mt-2">
                Duplica los puntos de tus cartas numéricas. Primero multiplica,
                luego suma los bonus.
              </div>
            </div>
          </div>
        </RuleSection>

        <RuleSection title="Fin de Ronda" icon="🏁">
          <p className="text-muted text-sm">La ronda termina cuando:</p>
          <ul className="list-disc list-inside text-sm space-y-1 text-muted">
            <li>No quedan jugadores activos (todos bust o stayed)</li>
            <li>Un jugador logra Flip 7 (7 cartas numéricas únicas)</li>
          </ul>
          <div className="bg-surface2 border border-border rounded-xl p-4 mt-4">
            <div className="font-semibold mb-2">📊 Calcular Puntuación</div>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Suma el valor de tus cartas numéricas</li>
              <li>Si tienes ×2, multiplica tu puntuación</li>
              <li>Suma cualquier bonus (+2, +4, etc.)</li>
              <li>
                Si hiciste Flip 7, añade{' '}
                <span className="text-gold font-bold">+15 puntos bonus</span>
              </li>
            </ol>
          </div>
          <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mt-4">
            <div className="font-semibold mb-2">💡 Ejemplo</div>
            <div className="text-sm space-y-1">
              <div>Cartas: 3 + 5 + 7 + 10 = 25 puntos</div>
              <div>Con modificador ×2: 25 × 2 = 50 puntos</div>
              <div>
                Con bonus +6: 50 + 6 ={' '}
                <span className="text-gold font-bold">56 puntos</span>
              </div>
            </div>
          </div>
        </RuleSection>

        <RuleSection title="Estrategia" icon="🧠">
          <div className="space-y-4">
            <div className="space-y-3">
              {strategies.map((s, i) => (
                <StrategyItem key={i} tip={s} />
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <div className="font-semibold mb-3 text-danger">
                ⚠️ Errores Comunes
              </div>
              <div className="space-y-3">
                {mistakes.map((m, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-xl">{m.icon}</span>
                    <div>
                      <div className="font-semibold">{m.title}</div>
                      <div className="text-sm text-muted">{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RuleSection>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4 pt-4"
        >
          <p className="text-muted">¿Listo para jugar?</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            🎮 Empezar a Jugar
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
