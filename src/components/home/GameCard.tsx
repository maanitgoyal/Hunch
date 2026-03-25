import { useNavigate } from 'react-router-dom'
import CollegeLogo from '../shared/CollegeLogo'
import { formatGameTime, getSportEmoji, hexToRgb, GAME_STATUS_COLORS } from '../../lib/utils'
import { useCountdown, formatCountdown } from '../../hooks/useCountdown'

interface GameCardProps {
  game: any
  userBetGameIds?: string[]
}

export default function GameCard({ game, userBetGameIds = [] }: GameCardProps) {
  const navigate = useNavigate()
  const { home_college, away_college } = game
  const hasBet = userBetGameIds.includes(game.id)
  const countdown = useCountdown(game.status === 'upcoming' ? game.scheduled_at : null)

  const openMarkets = game.bet_markets?.filter((m: any) => m.status === 'open').length ?? 0

  const homeRgb = hexToRgb(home_college?.primary_color ?? '#1a1a2e')
  const awayRgb = hexToRgb(away_college?.primary_color ?? '#16213e')

  const statusColor = GAME_STATUS_COLORS[game.status] ?? 'text-gray-400'

  const gradientStyle = {
    background: `linear-gradient(145deg, rgba(${homeRgb},0.9) 0%, rgba(${homeRgb},0.4) 45%, rgba(${awayRgb},0.4) 55%, rgba(${awayRgb},0.9) 100%)`,
    boxShadow: `0 4px 24px rgba(${homeRgb},0.15), 0 4px 24px rgba(${awayRgb},0.15)`,
    border: '1px solid rgba(255,255,255,0.12)',
  }

  return (
    <button
      onClick={() => navigate(`/game/${game.id}`)}
      className="w-full text-left rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] cursor-pointer group"
      style={{
        background: `linear-gradient(145deg, rgba(${homeRgb},0.9) 0%, rgba(${homeRgb},0.4) 45%, rgba(${awayRgb},0.4) 55%, rgba(${awayRgb},0.9) 100%)`,
        boxShadow: `0 4px 24px rgba(${homeRgb},0.15), 0 4px 24px rgba(${awayRgb},0.15)`,
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <div style={gradientStyle} className="relative overflow-hidden">
        {/* Shimmer overlay */}
        <div className="card-shimmer pointer-events-none absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/8 to-transparent skew-x-12" />
        <div className="p-4 relative">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-1.5">
            {game.status === 'live' && (
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            )}
            <span className={`text-xs font-bold uppercase tracking-widest ${statusColor}`}>
              {game.status}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {game.game_type && game.game_type !== 'regular_season' && (
              <span className="text-[10px] font-bold bg-violet-500/30 text-violet-200 rounded-full px-2 py-0.5 border border-violet-400/20 uppercase tracking-wide">
                {game.game_type === 'playoff_semi' ? 'Semi Final' : 'Grand Final'}
              </span>
            )}
            <span className="text-xs bg-black/25 text-white/80 rounded-full px-2.5 py-0.5 font-medium backdrop-blur-sm">
              {getSportEmoji(game.sport)} {game.sport}
            </span>
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center px-5 py-3 gap-4">
          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <CollegeLogo college={home_college} size={60} className="ring-2 ring-white/15 shadow-xl" />
            <span className="text-white font-bold text-sm text-center leading-tight drop-shadow">
              {home_college?.abbreviation ?? 'Home'}
            </span>
            {game.status === 'completed' && (
              <span className="text-3xl font-black text-white drop-shadow-lg">{game.home_score}</span>
            )}
          </div>

          {/* Middle */}
          <div className="flex flex-col items-center gap-1 px-2">
            {game.status === 'completed' ? (
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Final</span>
            ) : (
              <>
                <span className="text-white/40 font-black text-2xl">VS</span>
                {game.status !== 'completed' && game.status !== 'cancelled' && openMarkets > 0 && (
                  <span className="text-[10px] text-white/40 font-medium">
                    {openMarkets} open
                  </span>
                )}
              </>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <CollegeLogo college={away_college} size={60} className="ring-2 ring-white/15 shadow-xl" />
            <span className="text-white font-bold text-sm text-center leading-tight drop-shadow">
              {away_college?.abbreviation ?? 'Away'}
            </span>
            {game.status === 'completed' && (
              <span className="text-3xl font-black text-white drop-shadow-lg">{game.away_score}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/20 backdrop-blur-sm border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs">{formatGameTime(game.scheduled_at)}</span>
            {countdown && (
              <span className="text-[10px] font-bold bg-yellow-500/15 text-yellow-300 rounded-full px-2 py-0.5 border border-yellow-400/20 font-mono">
                Bets close in {formatCountdown(countdown)}
              </span>
            )}
          </div>
          {hasBet && (
            <span className="text-[10px] font-bold bg-green-500/20 text-green-400 rounded-full px-2 py-0.5 border border-green-400/25">
              Bet placed
            </span>
          )}
        </div>
        </div>
      </div>
    </button>
  )
}
