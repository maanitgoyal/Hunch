import { useState } from 'react'

// ─── Fake Bet Simulation ──────────────────────────────────────────────────────
function BetDemo() {
  const [phase, setPhase] = useState(0)
  const [stake, setStake] = useState(50)
  const payout = Math.round(stake * 1.85)

  if (phase === 2) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="text-5xl">🎉</div>
        <p className="text-green-400 font-black text-lg">Bet placed!</p>
        <div className="bg-green-500/10 border border-green-500/25 rounded-xl px-5 py-3 text-center">
          <p className="text-white font-bold text-sm">Warrane to win · 1.85x</p>
          <p className="text-gray-400 text-xs mt-1">Stake: 🪙 {stake} · Potential win: 🪙 {payout}</p>
        </div>
        <p className="text-gray-500 text-xs">Your bet is locked in. Good luck!</p>
      </div>
    )
  }

  if (phase === 1) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-400/25 rounded-xl px-3 py-2">
          <span className="text-violet-400 text-xs font-bold">✓ Warrane to win · 1.85x</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Stake</span>
            <span className="text-white font-bold">🪙 {stake}</span>
          </div>
          <input
            type="range" min={10} max={200} step={10}
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
            className="w-full accent-violet-400"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>10</span><span>200</span>
          </div>
        </div>
        <div className="flex justify-between text-xs px-1">
          <span className="text-gray-400">Potential payout</span>
          <span className="text-yellow-400 font-bold">🪙 {payout}</span>
        </div>
        <button
          onClick={() => setPhase(2)}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: 'linear-gradient(to right, #0891b2, #0ea5e9)' }}
        >
          Confirm Bet
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">● Live</span>
          <span className="text-[10px] text-gray-500">⚽ Soccer</span>
        </div>
        <div className="flex items-center justify-between px-2">
          <div className="text-center">
            <div className="w-9 h-9 rounded-lg bg-blue-500/30 flex items-center justify-center text-xs font-black text-white mx-auto">WA</div>
            <p className="text-white text-xs font-bold mt-1">Warrane</p>
          </div>
          <span className="text-white/30 font-black text-lg">VS</span>
          <div className="text-center">
            <div className="w-9 h-9 rounded-lg bg-red-500/30 flex items-center justify-center text-xs font-black text-white mx-auto">RH</div>
            <p className="text-white text-xs font-bold mt-1">Roundhouse</p>
          </div>
        </div>
      </div>
      <p className="text-gray-400 text-xs font-semibold px-1">Match Winner - tap to select</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Warrane',    odds: '1.85x' },
          { label: 'Draw',       odds: '3.20x' },
          { label: 'Roundhouse', odds: '2.10x' },
        ].map(({ label, odds }) => (
          <button
            key={label}
            onClick={() => label === 'Warrane' && setPhase(1)}
            className={`rounded-xl py-2 px-1 border text-center transition-all
              ${label === 'Warrane'
                ? 'bg-violet-500/15 border-violet-400/40 hover:bg-violet-500/25 cursor-pointer'
                : 'bg-white/5 border-white/8 opacity-60 cursor-default'}`}
          >
            <p className="text-white text-[10px] font-bold leading-tight">{label}</p>
            <p className="text-violet-400 text-xs font-black mt-0.5">{odds}</p>
          </button>
        ))}
      </div>
      <p className="text-gray-600 text-[10px] text-center">Tap <span className="text-violet-400">Warrane</span> to continue</p>
    </div>
  )
}

// ─── Minigames Demo ───────────────────────────────────────────────────────────
function MinigamesDemo() {
  const [game, setGame] = useState('menu')   // menu | coinflip | numguess | draft
  const [choice, setChoice] = useState(null) // heads | tails
  const [flipped, setFlipped] = useState(false)
  const [result, setResult] = useState(null) // win | lose

  function flip() {
    const outcome = Math.random() < 0.5 ? 'heads' : 'tails'
    setFlipped(true)
    setResult(outcome === choice ? 'win' : 'lose')
  }

  function reset() {
    setChoice(null)
    setFlipped(false)
    setResult(null)
    setGame('menu')
  }

  if (game === 'coinflip') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <button onClick={reset} className="text-gray-500 hover:text-gray-300 text-xs transition-colors">← Back</button>
          <p className="text-white font-bold text-sm">Coin Flip - 1.9x payout</p>
        </div>

        {!flipped ? (
          <>
            <p className="text-gray-400 text-xs">Pick heads or tails, then flip:</p>
            <div className="grid grid-cols-2 gap-2">
              {['heads', 'tails'].map((side) => (
                <button
                  key={side}
                  onClick={() => setChoice(side)}
                  className={`py-3 rounded-xl border text-sm font-bold capitalize transition-all
                    ${choice === side
                      ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300'
                      : 'bg-white/5 border-white/8 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                  {side === 'heads' ? '🪙 Heads' : '🌑 Tails'}
                </button>
              ))}
            </div>
            <button
              onClick={flip}
              disabled={!choice}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(to right, #d97706, #f59e0b)' }}
            >
              Flip!
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="text-5xl">{result === 'win' ? '🎉' : '😬'}</div>
            <p className={`font-black text-lg ${result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
              {result === 'win' ? 'You won! +1.9x' : 'Unlucky - try again!'}
            </p>
            <p className="text-gray-500 text-xs">
              It landed {result === 'win' ? choice : (choice === 'heads' ? 'tails' : 'heads')}
            </p>
            <button
              onClick={() => { setChoice(null); setFlipped(false); setResult(null) }}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: 'linear-gradient(to right, #d97706, #f59e0b)' }}
            >
              Flip again
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-gray-400 text-xs px-1 pb-1">Three minigames available - tap to try:</p>

      <button
        onClick={() => setGame('coinflip')}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-400/25 hover:bg-yellow-500/15 transition-all text-left cursor-pointer"
      >
        <span className="text-2xl">🪙</span>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Coin Flip</p>
          <p className="text-gray-500 text-xs">Pick heads or tails. Win 1.9x your stake.</p>
        </div>
        <span className="text-yellow-400 text-xs font-bold">Try it</span>
      </button>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-400/25">
        <span className="text-2xl">🎴</span>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Number Guess</p>
          <p className="text-gray-500 text-xs">Pick a 2-digit number. Land within +-2 to win 15x.</p>
        </div>
        <span className="text-violet-400 text-xs font-bold bg-violet-400/10 px-2 py-0.5 rounded-full">High risk</span>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-500/10 border border-pink-400/25">
        <span className="text-2xl">🏅</span>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Season Draft</p>
          <p className="text-gray-500 text-xs">Pick 3 colleges. Earn bonus coins every time they win.</p>
        </div>
        <span className="text-pink-400 text-xs font-bold bg-pink-400/10 px-2 py-0.5 rounded-full">Passive</span>
      </div>
    </div>
  )
}

// ─── Mini Leaderboard ─────────────────────────────────────────────────────────
function LeaderboardDemo() {
  const rows = [
    { name: 'alexchen', coins: 2840, you: false, streak: 5 },
    { name: 'you',      coins: 1660, you: true,  streak: 0 },
    { name: 'priya_k',  coins: 1420, you: false, streak: 0 },
  ]
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div
          key={r.name}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border
            ${r.you ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-white/5 border-white/8'}`}
        >
          <span className={`w-6 text-center font-black ${i === 0 ? 'text-yellow-400' : 'text-gray-400'}`}>
            {i === 0 ? '🥇' : `#${i + 1}`}
          </span>
          <span className={`flex-1 font-bold text-xs ${r.you ? 'text-yellow-300' : 'text-white'}`}>
            {r.name} {r.you && '(you)'}{' '}
            {r.streak >= 3 && <span className="text-orange-400">🔥{r.streak}</span>}
          </span>
          <span className="text-yellow-400 font-black text-xs">🪙 {r.coins.toLocaleString()}</span>
        </div>
      ))}
      <p className="text-gray-500 text-xs text-center pt-1">
        Switch to <span className="text-violet-400">Colleges</span> tab to see your college rank
      </p>
    </div>
  )
}

// ─── Mini Avatar Picker ───────────────────────────────────────────────────────
function AvatarDemo() {
  const [picked, setPicked] = useState(null)
  const emojis = ['🦁','🐯','🦊','🐺','🦅','🐻','🔥','⚡','💫','👑','🎯','🏆']
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 p-3 bg-white/5 border border-white/8 rounded-xl">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl border"
          style={{
            background: picked ? 'rgba(255,255,255,0.07)' : 'rgba(8,145,178,0.3)',
            borderColor: picked ? 'rgba(255,255,255,0.12)' : 'rgba(8,145,178,0.4)',
          }}
        >
          {picked ?? 'M'}
        </div>
        <div>
          <p className="text-white font-bold text-sm">maanitgoyal</p>
          <p className="text-gray-500 text-xs">Warrane College</p>
          <p className="text-yellow-400 text-xs mt-0.5">🪙 665</p>
        </div>
      </div>
      <p className="text-gray-400 text-xs px-1">Choose your avatar:</p>
      <div className="grid grid-cols-6 gap-1.5">
        {emojis.map((e) => (
          <button
            key={e}
            onClick={() => setPicked(e)}
            className={`aspect-square rounded-lg text-xl flex items-center justify-center transition-all hover:scale-110
              ${picked === e
                ? 'bg-violet-500/20 border border-violet-400/50 scale-110'
                : 'bg-white/5 border-white/8 hover:bg-white/10'}`}
          >
            {e}
          </button>
        ))}
      </div>
      {picked && <p className="text-green-400 text-xs text-center">Nice pick! Save it from your Profile page.</p>}
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'welcome',
    emoji: '👋',
    title: 'Welcome to Hunch',
    body: "The sports prediction platform for your college. Earn coins, climb the leaderboard, and prove you know the game better than anyone.",
    demo: null,
  },
  {
    id: 'games',
    emoji: '🎯',
    title: 'Place a bet',
    body: "Go to Games, tap a match, and pick your market. Odds shift as bets come in - lock yours in early. Try it below:",
    demo: <BetDemo />,
  },
  {
    id: 'minigames',
    emoji: '⚡',
    title: 'Minigames',
    body: "Want a quick win between games? Head to Minigames for three ways to earn coins fast:",
    demo: <MinigamesDemo />,
  },
  {
    id: 'leaderboard',
    emoji: '🏆',
    title: 'The leaderboard',
    body: "See how you stack up overall and by college. Players on a 3+ win streak get a 🔥 badge.",
    demo: <LeaderboardDemo />,
  },
  {
    id: 'profile',
    emoji: '✏️',
    title: 'Edit your profile',
    body: "Pick an avatar, update your display name, and track your season stats - all from the Profile page.",
    demo: <AvatarDemo />,
  },
  {
    id: 'done',
    emoji: '🚀',
    title: "You're ready!",
    body: "Join lobbies with friends, draft 3 colleges to earn bonus coins all season, and check back every Monday for your free 100 coins. Good luck!",
    demo: null,
  },
]

// ─── Modal ────────────────────────────────────────────────────────────────────
export default function TutorialModal({ onClose }) {
  const [step, setStep] = useState(0)
  const s = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border border-white/10 flex flex-col overflow-hidden max-h-[90vh]"
        style={{ background: 'rgba(10,12,16,0.98)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{s.emoji}</span>
            <h2 className="text-base font-black text-white">{s.title}</h2>
          </div>
          <button onClick={onClose} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            Skip
          </button>
        </div>

        {/* Body */}
        <div className="px-6 overflow-y-auto flex-1 space-y-4 pb-2">
          <p className="text-gray-400 text-sm leading-relaxed">{s.body}</p>
          {s.demo && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              {s.demo}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pt-3 pb-5 shrink-0 space-y-3">
          <div className="flex items-center justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === step ? '18px' : '6px',
                  height: '6px',
                  background: i === step ? '#a78bfa' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400 bg-white/6 border border-white/8 hover:bg-white/10 transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={() => isLast ? onClose() : setStep((s) => s + 1)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(to right, #0891b2, #0ea5e9)' }}
            >
              {isLast ? "Let's go!" : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
