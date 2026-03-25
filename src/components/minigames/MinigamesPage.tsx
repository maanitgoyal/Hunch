import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { coinFlip, numberGuess, getMyDraftPicks, saveDraftPick, removeDraftPick, getColleges } from '../../lib/minigames'
import CollegeLogo from '../shared/CollegeLogo'
import { formatCoins } from '../../lib/utils'

// ─── Confetti ───────────────────────────────────────────────
const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F472B6', '#34D399', '#FB923C']

interface ConfettiProps {
  triggerCount: number
}

function Confetti({ triggerCount }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animRef   = useRef<number>(0)
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    if (!triggerCount) return
    cancelAnimationFrame(animRef.current)

    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    setOpacity(1)

    const pieces = Array.from({ length: 130 }, () => ({
      x:     Math.random() * canvas.width,
      y:     -30 - Math.random() * 250,
      w:     Math.random() * 13 + 5,
      h:     Math.random() * 7 + 3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      vy:    Math.random() * 3 + 1.5,
      vx:    Math.random() * 2.4 - 1.2,
      rot:   Math.random() * 360,
      vrot:  Math.random() * 8 - 4,
      alpha: 1,
    }))

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = 0
      pieces.forEach((p) => {
        p.y   += p.vy
        p.x   += p.vx
        p.rot += p.vrot
        if (p.y > canvas.height * 0.70) p.alpha = Math.max(0, p.alpha - 0.025)
        if (p.alpha > 0) alive++
        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rot * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })
      if (alive > 0) {
        animRef.current = requestAnimationFrame(draw)
      } else {
        setOpacity(0)
      }
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [triggerCount])

  return (
    <canvas
      ref={canvasRef}
      style={{ opacity, transition: 'opacity 0.8s ease' }}
      className="fixed inset-0 pointer-events-none z-50"
    />
  )
}

// ─── Lose effect (red flash + shards) ───────────────────────
interface LoseEffectProps {
  triggerCount: number
}

function LoseEffect({ triggerCount }: LoseEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animRef   = useRef<number>(0)
  const [flashOp, setFlashOp] = useState(0)
  const [shardOp, setShardOp] = useState(0)

  useEffect(() => {
    if (!triggerCount) return
    cancelAnimationFrame(animRef.current)

    setFlashOp(0.18)
    setTimeout(() => setFlashOp(0), 350)

    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    setShardOp(1)

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const SHARD_COLORS = ['#ef4444', '#dc2626', '#b91c1c', '#6b7280', '#374151']

    const shards = Array.from({ length: 40 }, (_, i) => {
      const angle = (i / 40) * Math.PI * 2 + Math.random() * 0.3
      const speed = Math.random() * 5 + 2
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        w: Math.random() * 8 + 4,
        h: Math.random() * 5 + 2,
        rot: Math.random() * 360,
        vrot: Math.random() * 12 - 6,
        color: SHARD_COLORS[Math.floor(Math.random() * SHARD_COLORS.length)],
        alpha: 1,
        gravity: 0.18,
      }
    })

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = 0
      shards.forEach((s) => {
        s.vy   += s.gravity
        s.x    += s.vx
        s.y    += s.vy
        s.rot  += s.vrot
        s.alpha = Math.max(0, s.alpha - 0.022)
        if (s.alpha > 0) alive++
        ctx.save()
        ctx.globalAlpha = s.alpha
        ctx.translate(s.x, s.y)
        ctx.rotate((s.rot * Math.PI) / 180)
        ctx.fillStyle = s.color
        ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h)
        ctx.restore()
      })
      if (alive > 0) animRef.current = requestAnimationFrame(draw)
      else setShardOp(0)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [triggerCount])

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-40 bg-red-600"
        style={{ opacity: flashOp, transition: 'opacity 0.35s ease' }}
      />
      <canvas
        ref={canvasRef}
        style={{ opacity: shardOp, transition: 'opacity 0.5s ease' }}
        className="fixed inset-0 pointer-events-none z-49"
      />
    </>
  )
}

function useWinLose() {
  const [winCount,  setWinCount]  = useState(0)
  const [loseCount, setLoseCount] = useState(0)
  const fireWin  = useCallback(() => setWinCount((n) => n + 1),  [])
  const fireLose = useCallback(() => setLoseCount((n) => n + 1), [])
  return { winCount, loseCount, fireWin, fireLose }
}

// ─── Fading result banner ───────────────────────────────────
interface ResultBannerProps {
  result: any
  label: string
  won: boolean | undefined
  onClear: () => void
}

function ResultBanner({ result, label, won, onClear }: ResultBannerProps) {
  const [dismissing, setDismissing] = useState(false)

  useEffect(() => {
    if (!result) { setDismissing(false); return }
    const fadeId    = setTimeout(() => setDismissing(true), 2800)
    const clearId   = setTimeout(() => { onClear(); setDismissing(false) }, 3400)
    return () => { clearTimeout(fadeId); clearTimeout(clearId) }
  }, [result])

  if (!result) return null
  return (
    <div
      style={{ transition: 'opacity 0.55s ease' }}
      className={`rounded-xl px-4 py-3 text-center border
        ${won ? 'bg-green-500/15 border-green-400/30' : 'bg-red-500/15 border-red-400/30'}
        ${dismissing ? 'opacity-0' : 'opacity-100'}`}
    >
      <p className={`font-black text-lg ${won ? 'text-green-400' : 'text-red-400'}`}>{label}</p>
    </div>
  )
}

// ─── Coin Flip ──────────────────────────────────────────────
interface CoinFlipProps {
  userId: string
  coins: number
  onCoinsChanged: (coins: number) => void
  onWin: () => void
  onLose: () => void
}

function CoinFlip({ userId, coins, onCoinsChanged, onWin, onLose }: CoinFlipProps) {
  const maxStake = Math.min(500, coins)
  const [stake, setStake]       = useState(() => Math.min(50, Math.max(10, coins)))
  const [choice, setChoice]     = useState<string | null>(null)
  const [busy, setBusy]         = useState(false)
  const [result, setResult]     = useState<any>(null)
  const [flipping, setFlipping] = useState(false)
  const [shaking, setShaking]   = useState(false)

  useEffect(() => {
    if (stake > maxStake && maxStake >= 10) setStake(Math.max(10, maxStake))
  }, [maxStake])

  function triggerShake() {
    setShaking(false)
    requestAnimationFrame(() => setShaking(true))
    setTimeout(() => setShaking(false), 600)
  }

  async function handleFlip() {
    if (!choice || busy || coins < 10) return
    setBusy(true)
    setResult(null)
    setFlipping(true)
    await new Promise((r) => setTimeout(r, 900))
    setFlipping(false)
    const { data, error } = await coinFlip({ userId, stake, choice })
    setBusy(false)
    if (error) { alert((error as any).message); return }
    setResult(data)
    onCoinsChanged(data.coins)
    if (data.won) onWin()
    else { onLose(); triggerShake() }
  }

  const coinBorder = flipping ? 'border-yellow-400'
    : result ? (result.won ? 'border-green-400' : 'border-red-400')
    : 'border-white/20'

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🪙</span>
        <div>
          <h2 className="text-white font-black text-xl">Coin Flip</h2>
          <p className="text-gray-400 text-sm">50/50 - win 1.9x your stake</p>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl font-black transition-colors duration-300
            ${flipping ? 'animate-spin' : shaking ? 'card-shake' : ''} ${coinBorder}`}
          style={{ background: flipping ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.05)' }}
        >
          {flipping ? '?' : result ? (result.result === 'heads' ? 'H' : 'T') : '?'}
        </div>
      </div>

      <ResultBanner
        result={result}
        won={result?.won}
        label={result?.won
          ? `Won +${formatCoins(result.payout)} coins!`
          : `Lost ${formatCoins(stake)} - landed ${result?.result}`}
        onClear={() => setResult(null)}
      />

      <div className="flex gap-3">
        {['heads', 'tails'].map((c) => (
          <button key={c} onClick={() => setChoice(c)} disabled={busy}
            className={`flex-1 py-3 rounded-xl font-bold text-sm capitalize transition-all border
              ${choice === c ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/25'}`}>
            {c}
          </button>
        ))}
      </div>

      {coins < 10 ? (
        <p className="text-center text-red-400 text-sm font-semibold py-2">Not enough coins. Win some bets first!</p>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stake</label>
              <span className="text-yellow-400 font-bold text-sm">🪙 {formatCoins(stake)}</span>
            </div>
            <input type="range" min={10} max={maxStake} step={10} value={stake}
              onChange={(e) => setStake(Number(e.target.value))} disabled={busy}
              className="w-full accent-yellow-400" />
            <div className="flex justify-between text-gray-600 text-xs">
              <span>10</span>
              <span>Possible win: 🪙 {formatCoins(Math.floor(stake * 1.9))}</span>
              <span>{maxStake}</span>
            </div>
          </div>
          <button onClick={handleFlip} disabled={!choice || busy}
            className="w-full py-3 rounded-xl font-black text-black bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 transition-all active:scale-95">
            {busy ? 'Flipping...' : 'Flip!'}
          </button>
        </>
      )}
    </div>
  )
}

// ─── Number Guess ────────────────────────────────────────────
interface PlayingCardProps {
  revealed: boolean
  value: number | null | undefined
  won: boolean | null
  shaking: boolean
}

function PlayingCard({ revealed, value, won, shaking }: PlayingCardProps) {
  return (
    <div style={{ perspective: '700px' }} className="w-28 h-40 mx-auto">
      <div
        className={shaking ? 'card-shake' : ''}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.65s cubic-bezier(0.4,0,0.2,1)',
          transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
          position: 'relative', width: '100%', height: '100%',
        }}
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="absolute inset-0 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-[#1a1a3a] to-[#0d0d1f] flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-xl border-2 border-white/10 bg-white/5 flex items-center justify-center">
            <span className="text-4xl font-black text-white/30">?</span>
          </div>
        </div>
        {/* Back */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className={`absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-center gap-1
            ${won == null ? 'border-white/20 bg-[#1a1a3a]' : won ? 'border-green-400/60 bg-green-500/10' : 'border-red-400/60 bg-red-500/10'}`}
        >
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Number</span>
          <span className={`text-5xl font-black ${won ? 'text-green-400' : won === false ? 'text-red-400' : 'text-white'}`}>
            {value ?? '?'}
          </span>
          {won != null && (
            <span className={`text-xs font-bold mt-1 ${won ? 'text-green-400' : 'text-red-400'}`}>
              {won ? 'IN RANGE!' : 'MISS'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface NumberGuessProps {
  userId: string
  coins: number
  onCoinsChanged: (coins: number) => void
  onWin: () => void
  onLose: () => void
}

function NumberGuess({ userId, coins, onCoinsChanged, onWin, onLose }: NumberGuessProps) {
  const maxStake = Math.min(500, coins)
  const [stake, setStake]       = useState(() => Math.min(50, Math.max(10, coins)))
  const [guess, setGuess]       = useState(50)
  const [busy, setBusy]         = useState(false)
  const [result, setResult]     = useState<any>(null)
  const [revealed, setRevealed] = useState(false)
  const [shaking, setShaking]   = useState(false)

  useEffect(() => {
    if (stake > maxStake && maxStake >= 10) setStake(Math.max(10, maxStake))
  }, [maxStake])

  async function handleGuess() {
    if (busy || coins < 10) return
    setBusy(true)
    setResult(null)
    setRevealed(false)
    setShaking(false)
    const { data, error } = await numberGuess({ userId, stake, guess })
    setBusy(false)
    if (error) { alert((error as any).message); return }
    setTimeout(() => {
      setResult(data)
      setTimeout(() => {
        setRevealed(true)
        if (!data.won) {
          setTimeout(() => {
            setShaking(false)
            requestAnimationFrame(() => setShaking(true))
            setTimeout(() => setShaking(false), 600)
          }, 300)
        }
      }, 100)
    }, 300)
    onCoinsChanged(data.coins)
    if (data.won) onWin()
    else onLose()
  }

  const rangeStart = guess - 2
  const rangeEnd   = guess + 2

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🎴</span>
        <div>
          <h2 className="text-white font-black text-xl">Number Guess</h2>
          <p className="text-gray-400 text-sm">Guess within 2 of a 2-digit number - win 15x</p>
        </div>
      </div>

      <PlayingCard revealed={revealed} value={result?.secret} won={result ? result.won : null} shaking={shaking} />

      <ResultBanner
        result={result && revealed ? result : null}
        won={result?.won}
        label={result?.won
          ? `Won +${formatCoins(result.payout)} coins!`
          : `Missed! ${result?.secret} was outside ${rangeStart}-${rangeEnd}`}
        onClear={() => { setResult(null); setRevealed(false) }}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Guess</label>
          <span className="text-white font-bold text-sm">
            Range: <span className="text-violet-400">{rangeStart} - {rangeEnd}</span>
          </span>
        </div>
        <input type="range" min={12} max={97} step={1} value={guess}
          onChange={(e) => setGuess(Number(e.target.value))} disabled={busy}
          className="w-full accent-violet-400" />
        <div className="flex justify-center">
          <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 text-center">
            <p className="text-4xl font-black text-white">{guess}</p>
            <p className="text-gray-600 text-xs">±2 range</p>
          </div>
        </div>
      </div>

      {coins < 10 ? (
        <p className="text-center text-red-400 text-sm font-semibold py-2">Not enough coins. Win some bets first!</p>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stake</label>
              <span className="text-yellow-400 font-bold text-sm">🪙 {formatCoins(stake)}</span>
            </div>
            <input type="range" min={10} max={maxStake} step={10} value={stake}
              onChange={(e) => setStake(Number(e.target.value))} disabled={busy}
              className="w-full accent-yellow-400" />
            <div className="flex justify-between text-gray-600 text-xs">
              <span>10</span>
              <span>Possible win: 🪙 {formatCoins(stake * 15)}</span>
              <span>{maxStake}</span>
            </div>
          </div>
          <button onClick={handleGuess} disabled={busy}
            className="w-full py-3 rounded-xl font-black text-black bg-violet-400 hover:bg-violet-300 disabled:opacity-40 transition-all active:scale-95">
            {busy ? 'Revealing...' : 'Reveal!'}
          </button>
        </>
      )}
    </div>
  )
}

// ─── Draft Pick ──────────────────────────────────────────────
const RANK_LABELS  = ['1st Pick', '2nd Pick', '3rd Pick']
const RANK_BONUSES = [50, 30, 20]

interface DraftPickProps {
  userId: string
}

function DraftPick({ userId }: DraftPickProps) {
  const [picks, setPicks]       = useState<(any | null)[]>([null, null, null])
  const [colleges, setColleges] = useState<any[]>([])
  const [editing, setEditing]   = useState<number | null>(null)
  const [search, setSearch]     = useState('')
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    getMyDraftPicks(userId).then(({ data }) => {
      if (!data) return
      const p: (any | null)[] = [null, null, null]
      data.forEach((d: any) => { p[d.pick_rank - 1] = d.colleges })
      setPicks(p)
    })
    getColleges().then(({ data }) => setColleges(data ?? []))
  }, [userId])

  const pickedIds = picks.filter(Boolean).map((c) => c.id)

  async function handlePick(college: any) {
    const rank = editing!
    setSaving(true)
    await saveDraftPick({ userId, collegeId: college.id, pickRank: rank })
    const p = [...picks]; p[rank - 1] = college
    setPicks(p); setEditing(null); setSearch(''); setSaving(false)
  }

  async function handleRemove(rank: number) {
    await removeDraftPick({ userId, pickRank: rank })
    const p = [...picks]; p[rank - 1] = null; setPicks(p)
  }

  const filtered = colleges.filter(
    (c) => !pickedIds.includes(c.id) && c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏅</span>
        <div>
          <h2 className="text-white font-black text-xl">Season Draft</h2>
          <p className="text-gray-400 text-sm">Pick 3 colleges - earn coins every time they win</p>
        </div>
      </div>

      <div className="flex gap-2 text-xs text-center">
        {RANK_BONUSES.map((b, i) => (
          <div key={i} className="flex-1 bg-white/5 rounded-lg py-2 border border-white/8">
            <p className="text-yellow-400 font-black">+{b}</p>
            <p className="text-gray-500">per win ({i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : 'rd'})</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {picks.map((college, i) => {
          const rank = i + 1
          return (
            <div key={rank} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-xs font-black text-gray-500 w-14">{RANK_LABELS[i]}</span>
              {college ? (
                <>
                  <CollegeLogo college={college} size={32} />
                  <span className="flex-1 text-white font-semibold text-sm">{college.name}</span>
                  <button onClick={() => handleRemove(rank)} className="text-xs text-gray-600 hover:text-red-400 transition-colors">Remove</button>
                </>
              ) : (
                <>
                  <div className="flex-1 text-gray-600 text-sm italic">Empty slot</div>
                  <button onClick={() => { setEditing(rank); setSearch('') }} className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">+ Pick</button>
                </>
              )}
            </div>
          )
        })}
      </div>

      {editing && (
        <div className="space-y-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search college for ${RANK_LABELS[editing - 1]}...`} autoFocus
            className="w-full px-4 py-2.5 rounded-xl bg-[#111118] border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-400/60 transition-all" />
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filtered.map((c) => (
              <button key={c.id} onClick={() => handlePick(c)} disabled={saving}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 transition-all text-left">
                <CollegeLogo college={c} size={28} />
                <span className="text-white text-sm font-medium">{c.name}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-gray-600 text-sm text-center py-3">No colleges found</p>}
          </div>
          <button onClick={() => { setEditing(null); setSearch('') }} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Cancel</button>
        </div>
      )}
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────
export default function MinigamesPage() {
  const { profile, refreshProfile } = useAuth()
  const [coins, setCoins] = useState(profile?.coins ?? 0)
  const { winCount, loseCount, fireWin, fireLose } = useWinLose()

  useEffect(() => { setCoins(profile?.coins ?? 0) }, [profile?.coins])

  function handleCoinsChanged(newCoins: number) {
    setCoins(newCoins)
    refreshProfile()
  }

  if (!profile) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <Confetti triggerCount={winCount} />
      <LoseEffect triggerCount={loseCount} />

      <div>
        <h1 className="text-3xl font-black text-white">Minigames</h1>
        <p className="text-gray-400 mt-1">Quick games between matches</p>
      </div>

      <CoinFlip userId={profile.id} coins={coins} onCoinsChanged={handleCoinsChanged} onWin={fireWin} onLose={fireLose} />
      <NumberGuess userId={profile.id} coins={coins} onCoinsChanged={handleCoinsChanged} onWin={fireWin} onLose={fireLose} />
      <DraftPick userId={profile.id} />
    </div>
  )
}
