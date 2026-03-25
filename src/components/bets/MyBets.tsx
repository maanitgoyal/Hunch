import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBets } from '../../hooks/useBets'
import { useUser } from '../../hooks/useUser'
import CollegeLogo from '../shared/CollegeLogo'
import { formatCoins, formatGameTime, getSportEmoji, STATUS_COLORS } from '../../lib/utils'

interface BetCardProps {
  bet: any
  navigate: (path: string) => void
}

function BetCard({ bet, navigate }: BetCardProps) {
  const game   = bet.games
  const market = bet.bet_markets
  const status = STATUS_COLORS[bet.status] ?? STATUS_COLORS.pending
  const option = market?.options?.find((o: any) => o.key === bet.selected_option_key)

  return (
    <button
      onClick={() => navigate(`/game/${bet.game_id}`)}
      className="w-full text-left bg-white border border-[#e0dbd3] rounded-2xl overflow-hidden active:scale-95 transition-transform"
    >
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-[#e0dbd3]">
        <CollegeLogo college={game?.home_college} size={32} />
        <div className="flex-1 min-w-0">
          <p className="text-[#1a2744] font-semibold text-sm truncate">
            {game?.home_college?.abbreviation} vs {game?.away_college?.abbreviation}
          </p>
          <p className="text-[#6b7a99] text-xs">
            {getSportEmoji(game?.sport)} {game?.sport} · {formatGameTime(game?.scheduled_at)}
          </p>
        </div>
        <CollegeLogo college={game?.away_college} size={32} />
      </div>

      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[#6b7a99] text-xs mb-0.5">{market?.description}</p>
          <p className="text-[#1a2744] font-medium text-sm truncate">{option?.label ?? bet.selected_option_key}</p>
        </div>
        <div className="text-right ml-3">
          <div className={`text-xs font-bold px-2 py-1 rounded-full mb-1 ${status.bg} ${status.text}`}>
            {status.label}
          </div>
          <p className="text-[#6b7a99] text-xs">🪙 {formatCoins(bet.stake)}</p>
          {bet.status === 'pending'  && <p className="text-amber-600 text-xs">→ {formatCoins(bet.potential_payout)}</p>}
          {bet.status === 'won'      && <p className="text-green-400 text-xs font-bold">+{formatCoins(bet.payout)}</p>}
          {bet.status === 'lost'     && <p className="text-red-400 text-xs">-{formatCoins(bet.stake)}</p>}
          {bet.status === 'refunded' && <p className="text-[#6b7a99] text-xs">refunded</p>}
        </div>
      </div>
    </button>
  )
}

const FILTERS = ['All', 'Pending', 'Won', 'Lost']

export default function MyBets() {
  const { profile } = useUser()
  const { bets, loading } = useBets(profile?.id)
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')

  const won     = bets.filter((b) => b.status === 'won')
  const lost    = bets.filter((b) => b.status === 'lost')
  const pending = bets.filter((b) => b.status === 'pending')
  const settled = [...won, ...lost]

  const netPL        = settled.reduce((acc: number, b) => b.status === 'won' ? acc + (b.payout - b.stake) : acc - b.stake, 0)
  const totalWagered = bets.reduce((acc: number, b) => acc + b.stake, 0)
  const bestWin      = won.reduce((best: number, b) => Math.max(best, b.payout - b.stake), 0)

  const displayed = filter === 'All'     ? bets
                  : filter === 'Pending' ? pending
                  : filter === 'Won'     ? won
                  :                        lost

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-3xl font-black text-[#1a2744]">My Bets</h1>
        <p className="text-[#6b7a99] mt-1">Your betting history</p>
      </div>

      {/* Stats bar */}
      {bets.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total wagered', value: `🪙 ${formatCoins(totalWagered)}`, color: 'text-[#1a2744]' },
            { label: 'Net P&L',       value: `${netPL >= 0 ? '+' : ''}${formatCoins(netPL)}`, color: netPL >= 0 ? 'text-green-400' : 'text-red-400' },
            { label: 'Best win',      value: bestWin > 0 ? `+${formatCoins(bestWin)}` : '-', color: 'text-amber-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-[#e0dbd3] rounded-xl px-3 py-3 text-center">
              <p className={`font-black text-sm ${color}`}>{value}</p>
              <p className="text-[#8a9ab0] text-[10px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 bg-[#f5f2ee] p-1 rounded-xl">
        {FILTERS.map((f) => {
          const count = f === 'All' ? bets.length : f === 'Pending' ? pending.length : f === 'Won' ? won.length : lost.length
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all relative
                ${filter === f
                  ? 'bg-[#1a2744] text-white shadow-lg shadow-[#1a2744]/10'
                  : 'text-[#6b7a99] hover:text-[#1a2744]'}`}
            >
              {f}
              {count > 0 && (
                <span className={`ml-1 ${filter === f ? 'text-white/70' : 'text-[#9aaac0]'}`}>({count})</span>
              )}
            </button>
          )
        })}
      </div>

      {/* List */}
      <div className="space-y-3 pb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-[#f5f2ee] animate-pulse" />
          ))
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#e0dbd3] rounded-2xl text-[#8a9ab0]">
            <div className="text-4xl mb-3">{filter === 'Won' ? '🏆' : filter === 'Lost' ? '😬' : '🎯'}</div>
            <p className="font-semibold">No {filter.toLowerCase()} bets</p>
            {filter === 'All' && (
              <button onClick={() => navigate('/')} className="text-amber-600 text-sm mt-2 hover:underline">
                Browse upcoming games →
              </button>
            )}
          </div>
        ) : (
          displayed.map((bet) => <BetCard key={bet.id} bet={bet} navigate={navigate} />)
        )}
      </div>
    </div>
  )
}
