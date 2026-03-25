import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const BANNERS = [
  {
    id: 'bet-now',
    bg: 'from-[#0d1f3c] via-[#0a3060] to-[#061428]',
    accent: '#a78bfa',
    glow: 'rgba(139,92,246,0.35)',
    shimmer: 'from-violet-500/0 via-violet-400/20 to-violet-500/0',
    eyebrow: '⚽  LIVE MARKETS OPEN',
    headline: "Think you know\nwho's going to win?",
    sub: 'Lock in your odds before they shift.',
    cta: 'Place a Bet',
    route: '/games',
    badge: null,
    graphic: '🏆',
  },
  {
    id: 'coin-flip',
    bg: 'from-[#1a0f00] via-[#3a1f00] to-[#1a0a00]',
    accent: '#fbbf24',
    glow: 'rgba(251,191,36,0.35)',
    shimmer: 'from-yellow-500/0 via-yellow-400/20 to-yellow-500/0',
    eyebrow: '🪙  INSTANT WIN',
    headline: 'Heads or tails?\nDouble your coins.',
    sub: '50/50 shot. 1.9x payout. Takes 5 seconds.',
    cta: 'Flip Now',
    route: '/minigames',
    badge: 'MINIGAME',
    graphic: '🪙',
  },
  {
    id: 'number-guess',
    bg: 'from-[#0d0a2e] via-[#1a1060] to-[#080520]',
    accent: '#a78bfa',
    glow: 'rgba(167,139,250,0.35)',
    shimmer: 'from-violet-500/0 via-violet-400/20 to-violet-500/0',
    eyebrow: '🎴  HIGH RISK HIGH REWARD',
    headline: 'Guess the number.\nWin 15x your stake.',
    sub: 'Pick any 2-digit number. Land within ±2 to win.',
    cta: 'Play Now',
    route: '/minigames',
    badge: 'MINIGAME',
    graphic: '🎴',
  },
  {
    id: 'leaderboard',
    bg: 'from-[#0a1f0a] via-[#0d3a0d] to-[#061406]',
    accent: '#34d399',
    glow: 'rgba(52,211,153,0.35)',
    shimmer: 'from-emerald-500/0 via-emerald-400/20 to-emerald-500/0',
    eyebrow: '📊  SEASON STANDINGS',
    headline: "Where does your\ncollege rank?",
    sub: 'Climb the leaderboard. Win glory for your college.',
    cta: 'View Leaderboard',
    route: '/leaderboard',
    badge: null,
    graphic: '🏅',
  },
  {
    id: 'draft',
    bg: 'from-[#1a0a1f] via-[#2d0f3a] to-[#100814]',
    accent: '#f472b6',
    glow: 'rgba(244,114,182,0.35)',
    shimmer: 'from-pink-500/0 via-pink-400/20 to-pink-500/0',
    eyebrow: '🏅  SEASON DRAFT',
    headline: 'Back 3 colleges.\nEarn coins all season.',
    sub: 'Your 1st pick earns +50 coins every time they win.',
    cta: 'Pick Now',
    route: '/minigames',
    badge: 'NEW',
    graphic: '🎯',
  },
]

export default function PromoBanner() {
  const [idx, setIdx]         = useState(0)
  const [animDir, setAnimDir] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate()

  function go(dir: string) {
    if (animDir) return
    setAnimDir(dir)
    setVisible(false)
    setTimeout(() => {
      setIdx((i) => (dir === 'right' ? (i + 1) % BANNERS.length : (i - 1 + BANNERS.length) % BANNERS.length))
      setVisible(true)
      setAnimDir(null)
    }, 280)
    resetTimer()
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => go('right'), 8000)
  }

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const b = BANNERS[idx]

  return (
    <div className="relative select-none">
      {/* Banner */}
      <div
        onClick={() => navigate(b.route)}
        style={{
          transition: 'opacity 0.28s ease, transform 0.28s ease',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateX(0)' : animDir === 'right' ? 'translateX(-18px)' : 'translateX(18px)',
          boxShadow: `0 0 40px 0 ${b.glow}, inset 0 1px 0 rgba(255,255,255,0.07)`,
          borderColor: `${b.accent}30`,
        }}
        className={`relative overflow-hidden rounded-2xl border cursor-pointer bg-gradient-to-br ${b.bg} p-7 min-h-[200px] flex flex-col justify-between`}
      >
        {/* Animated shimmer stripe */}
        <div
          className={`absolute inset-y-0 w-1/2 bg-gradient-to-r ${b.shimmer} pointer-events-none`}
          style={{ animation: 'banner-shimmer 3.5s ease-in-out infinite' }}
        />

        {/* Glow orb */}
        <div
          className="absolute -right-8 -top-8 w-40 h-40 rounded-full blur-3xl pointer-events-none"
          style={{ background: b.glow, opacity: 0.5 }}
        />

        {/* Big graphic */}
        <div className="absolute right-6 bottom-4 text-7xl opacity-15 pointer-events-none leading-none">
          {b.graphic}
        </div>

        {/* Content */}
        <div className="relative space-y-2.5">
          {/* Eyebrow */}
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-black tracking-widest uppercase"
              style={{ color: b.accent }}
            >
              {b.eyebrow}
            </span>
            {b.badge && (
              <span
                className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: `${b.accent}25`, color: b.accent, border: `1px solid ${b.accent}50` }}
              >
                {b.badge}
              </span>
            )}
          </div>

          {/* Headline */}
          <h2 className="text-white font-black text-xl leading-tight whitespace-pre-line">
            {b.headline}
          </h2>

          {/* Sub */}
          <p className="text-white/50 text-xs leading-relaxed">{b.sub}</p>
        </div>

        {/* CTA */}
        <div className="relative mt-4">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl transition-all"
            style={{
              background: `${b.accent}22`,
              color: b.accent,
              border: `1px solid ${b.accent}45`,
            }}
          >
            {b.cta} →
          </span>
        </div>
      </div>

      {/* Arrows + dot indicators */}
      <div className="flex items-center justify-center gap-3 mt-3">
        <button
          onClick={() => go('left')}
          className="w-7 h-7 rounded-full bg-white/8 border border-white/10 text-white/60 hover:text-white hover:bg-white/15 flex items-center justify-center text-sm transition-all"
        >
          ‹
        </button>

        <div className="flex items-center gap-1.5">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setAnimDir('right'); setVisible(false); setTimeout(() => { setIdx(i); setVisible(true); setAnimDir(null) }, 280); resetTimer() }}
              className="rounded-full transition-all"
              style={{
                width:  i === idx ? '18px' : '6px',
                height: '6px',
                background: i === idx ? BANNERS[idx].accent : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => go('right')}
          className="w-7 h-7 rounded-full bg-white/8 border border-white/10 text-white/60 hover:text-white hover:bg-white/15 flex items-center justify-center text-sm transition-all"
        >
          ›
        </button>
      </div>
    </div>
  )
}
