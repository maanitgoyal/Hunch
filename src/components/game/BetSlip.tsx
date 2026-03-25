import { useState } from 'react'
import { placeBet } from '../../lib/betting'
import { useAuth } from '../../context/AuthContext'
import { formatCoins } from '../../lib/utils'

interface BetSlipProps {
  market: any
  selectedOptionKey: string
  onSuccess: (data: any) => void
  onClose: () => void
}

function calcLockedPayout(stake: number, optionKey: string, optionStakes: Record<string, number>, initialOdds: number | undefined) {
  const prevTotal      = Object.values(optionStakes).reduce((s, v) => s + Number(v), 0)
  const prevOptionStake = optionStakes[optionKey] ?? 0

  if (prevTotal === 0) {
    return Math.floor(stake * (initialOdds ?? 2.0))
  }
  const newOptionStake = prevOptionStake + stake
  const newTotal       = prevTotal + stake
  return Math.floor(stake * newTotal / newOptionStake)
}

export default function BetSlip({ market, selectedOptionKey, onSuccess, onClose }: BetSlipProps) {
  const { profile, refreshProfile } = useAuth()
  const [stake, setStake] = useState(50)
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')

  const option        = market.options.find((o: any) => o.key === selectedOptionKey)
  const optionStakes  = market.option_stakes ?? {}
  const maxStake      = Math.min(500, profile?.coins ?? 0)
  const lockedPayout  = calcLockedPayout(stake, selectedOptionKey, optionStakes, option?.odds)

  const prevTotal      = Object.values(optionStakes).reduce((s: number, v) => s + Number(v), 0)
  const lockedMultiplier = prevTotal === 0
    ? (option?.odds ?? 2.0)
    : (prevTotal + stake) / ((optionStakes[selectedOptionKey] ?? 0) + stake)

  async function handleSubmit() {
    if (stake < 10)        { setError('Minimum bet is 10 coins'); return }
    if (stake > maxStake)  { setError(`You only have ${formatCoins(profile!.coins)} coins`); return }
    setBusy(true)
    setError('')
    const { data, error } = await placeBet({
      userId: profile!.id,
      marketId: market.id,
      gameId: market.game_id,
      selectedOptionKey,
      stake,
    })
    setBusy(false)
    if (error) { setError((error as any).message); return }
    await refreshProfile()
    onSuccess(data)
  }

  if (!option) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg bg-white rounded-t-3xl border-t border-[#e0dbd3] p-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[#1a2744] font-bold text-lg">Place Bet</h3>
          <button onClick={onClose} className="text-[#6b7a99] hover:text-[#1a2744] text-2xl leading-none">×</button>
        </div>

        {/* Selection */}
        <div className="bg-[#f5f2ee] rounded-xl p-3 mb-4">
          <p className="text-[#6b7a99] text-xs mb-1">{market.description}</p>
          <p className="text-[#1a2744] font-semibold">{option.label}</p>
        </div>

        {/* Stake input */}
        <label className="block text-sm text-[#6b7a99] mb-2">Stake (coins)</label>
        <input
          type="number"
          value={stake}
          min={10}
          max={maxStake}
          onChange={(e) => setStake(Math.max(10, Math.min(maxStake, Number(e.target.value))))}
          className="w-full px-4 py-3 rounded-xl bg-[#ece7e0] border border-[#d0c9bf] text-[#1a2744] text-xl font-bold text-center focus:outline-none focus:border-yellow-400 transition-colors mb-3"
        />

        <input
          type="range"
          min={10}
          max={maxStake}
          step={10}
          value={stake}
          onChange={(e) => setStake(Number(e.target.value))}
          className="w-full accent-yellow-400 mb-4"
        />

        {/* Quick amounts */}
        <div className="flex gap-2 mb-5">
          {[25, 50, 100, 250].map((amt) => (
            <button
              key={amt}
              onClick={() => setStake(Math.min(amt, maxStake))}
              disabled={amt > maxStake}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-[#ece7e0] text-[#4a5a7a] hover:bg-[#e8e2da] disabled:opacity-30 transition-colors"
            >
              {amt}
            </button>
          ))}
        </div>

        {/* Locked payout */}
        <div className="bg-[#f5f2ee] rounded-xl px-4 py-3 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-[#6b7a99] text-sm">Locked return</span>
            <span className="text-green-400 font-black text-xl">🪙 {formatCoins(lockedPayout)}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[#9aaac0] text-xs">Your odds (locked on confirm)</span>
            <span className="text-amber-600 text-xs font-bold">{lockedMultiplier.toFixed(2)}x</span>
          </div>
        </div>
        <p className="text-[#9aaac0] text-[10px] text-center mb-4">
          This return is locked the moment you confirm. Odds shift as others bet.
        </p>

        {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={busy || maxStake < 10}
          className="w-full py-4 rounded-xl font-black text-black text-lg bg-yellow-400 hover:bg-yellow-300 active:scale-95 disabled:opacity-50 transition-all"
        >
          {busy ? 'Placing...' : `Bet ${formatCoins(stake)} coins →`}
        </button>

        <p className="text-center text-[#8a9ab0] text-xs mt-3">
          Balance: 🪙 {formatCoins(profile?.coins ?? 0)}
        </p>
      </div>
    </div>
  )
}
