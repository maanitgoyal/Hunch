import { useState } from 'react'
import { formatCoins, STATUS_COLORS } from '../../lib/utils'
import BetSlip from './BetSlip'

interface MarketCardProps {
  market: any
  existingBets?: any[]
  userCoins: number
  onBetPlaced?: () => void
}

interface PoolBarProps {
  options: any[]
  optionStakes: Record<string, number>
}

const MARKET_TYPE_LABELS: Record<string, string> = {
  winner:                  '🏆 Match Winner',
  margin_range:            '⚽ Winning Margin',
  total_points_over_under: '🔢 Total Goals',
  first_to_score:          '⚡ First to Score',
}

function PoolBar({ options, optionStakes }: PoolBarProps) {
  const total = options.reduce((sum: number, o: any) => sum + (optionStakes[o.key] ?? 0), 0)
  if (total === 0) return null

  return (
    <div className="flex rounded-full overflow-hidden h-1 mb-3 gap-px">
      {options.map((o: any, i: number) => {
        const stake = optionStakes[o.key] ?? 0
        const pct = total > 0 ? (stake / total) * 100 : 0
        const colors = ['bg-violet-500', 'bg-purple-500', 'bg-amber-500']
        return (
          <div
            key={o.key}
            className={`${colors[i % colors.length]} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        )
      })}
    </div>
  )
}

export default function MarketCard({ market, existingBets = [], userCoins, onBetPlaced }: MarketCardProps) {
  const [selected, setSelected]  = useState<string | null>(null)
  const [showSlip, setShowSlip]  = useState(false)
  const [successMsg, setSuccess] = useState('')

  const isLocked   = market.status !== 'open'
  const isResolved = market.status === 'resolved'

  const userBetKeys = new Set(existingBets.map((b) => b.selected_option_key))

  const optionStakes = market.option_stakes ?? {}
  const totalPool    = Object.values(optionStakes).reduce((s: number, v) => s + Number(v), 0)

  function liveOdds(opt: any) {
    const stake = optionStakes[opt.key] ?? 0
    if (stake > 0 && totalPool > 0) return totalPool / stake
    return opt.odds ?? null
  }

  function handleOptionClick(optionKey: string) {
    if (isLocked) return
    setSelected(selected === optionKey ? null : optionKey)
  }

  function handleBetSuccess(data: any) {
    setShowSlip(false)
    setSelected(null)
    setSuccess(`Bet placed! Locked return: 🪙 ${formatCoins(data.potential_payout)}`)
    setTimeout(() => setSuccess(''), 4000)
    onBetPlaced?.()
  }

  return (
    <>
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">{MARKET_TYPE_LABELS[market.market_type]}</p>
            <p className="text-white font-semibold text-sm mt-0.5">{market.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {totalPool > 0 && (
              <span className="text-xs text-gray-400">
                Pool: <span className="text-yellow-400 font-bold">🪙 {formatCoins(totalPool)}</span>
              </span>
            )}
            <span className={`
              text-xs font-bold px-2 py-1 rounded-full
              ${isResolved ? 'bg-gray-500/20 text-gray-400'
                : isLocked ? 'bg-red-500/20 text-red-400'
                : 'bg-green-500/20 text-green-400'}
            `}>
              {isResolved ? 'Resolved' : isLocked ? 'Locked' : 'Open'}
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2">
          <PoolBar options={market.options} optionStakes={optionStakes} />

          {market.options.map((opt: any) => {
            const isCorrect    = isResolved && opt.key === market.correct_option_key
            const isUserPick   = userBetKeys.has(opt.key)
            const isWrong      = isResolved && isUserPick && opt.key !== market.correct_option_key
            const isSelectedUI = selected === opt.key
            const stake        = optionStakes[opt.key] ?? 0
            const multiplier   = liveOdds(opt)

            let borderClass = 'border-white/10'
            let bgClass     = 'bg-white/5'
            let textClass   = 'text-gray-200'

            if (isCorrect)       { borderClass = 'border-green-400'; bgClass = 'bg-green-500/15'; textClass = 'text-green-300' }
            else if (isWrong)    { borderClass = 'border-red-400';   bgClass = 'bg-red-500/15';   textClass = 'text-red-300'   }
            else if (isSelectedUI) { borderClass = 'border-violet-400'; bgClass = 'bg-violet-500/10' }
            else if (isUserPick) { borderClass = 'border-yellow-400/60'; bgClass = 'bg-yellow-500/10' }

            return (
              <button
                key={opt.key}
                onClick={() => handleOptionClick(opt.key)}
                disabled={isLocked}
                className={`
                  w-full flex items-center justify-between rounded-xl border px-4 py-3
                  ${bgClass} ${borderClass} ${textClass}
                  transition-all duration-150
                  ${!isLocked ? 'hover:bg-white/10 active:scale-[0.98] cursor-pointer' : 'cursor-default'}
                `}
              >
                <div className="flex items-center gap-2">
                  {isUserPick && !isCorrect && !isWrong && <span className="text-yellow-400 text-xs">●</span>}
                  {isCorrect  && <span>✅</span>}
                  {isWrong    && <span>❌</span>}
                  <span className="font-medium text-sm">{opt.label}</span>
                </div>

                <div className="flex flex-col items-end gap-0.5">
                  {multiplier ? (
                    <span className="text-yellow-400 font-bold text-sm">{Number(multiplier).toFixed(2)}x</span>
                  ) : (
                    <span className="text-gray-600 text-xs">-</span>
                  )}
                  {stake > 0 && (
                    <span className="text-gray-500 text-[10px]">🪙 {formatCoins(stake)} staked</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 space-y-2">
          {/* Existing bets */}
          {existingBets.length > 0 && (
            <div className="space-y-1">
              {existingBets.map((bet) => {
                const optLabel = market.options.find((o: any) => o.key === bet.selected_option_key)?.label ?? bet.selected_option_key
                return (
                  <div
                    key={bet.id}
                    className={`rounded-xl px-4 py-2 text-xs flex items-center justify-between
                      ${STATUS_COLORS[bet.status]?.bg} border border-current/20 ${STATUS_COLORS[bet.status]?.text}`}
                  >
                    <span>{optLabel} - 🪙 {formatCoins(bet.stake)} · {STATUS_COLORS[bet.status]?.label}</span>
                    {bet.status === 'won' && <span>Won 🪙 {formatCoins(bet.payout)}</span>}
                  </div>
                )
              })}
            </div>
          )}

          {/* Place new bet */}
          {selected && !isLocked && (
            <button
              onClick={() => setShowSlip(true)}
              className="w-full py-3 rounded-xl font-bold text-black bg-yellow-400 hover:bg-yellow-300 active:scale-95 transition-all"
            >
              {existingBets.length > 0 ? 'Bet Again →' : 'Place Bet →'}
            </button>
          )}

          {successMsg && (
            <p className="text-green-400 text-sm text-center">{successMsg}</p>
          )}
        </div>
      </div>

      {showSlip && (
        <BetSlip
          market={market}
          selectedOptionKey={selected!}
          onSuccess={handleBetSuccess}
          onClose={() => setShowSlip(false)}
        />
      )}
    </>
  )
}
