import { useState } from 'react'
import { useGames } from '../../hooks/useGames'
import { useUser } from '../../hooks/useUser'
import { useBets } from '../../hooks/useBets'
import GameCard from './GameCard'

const FILTERS = ['upcoming', 'live', 'completed']

export default function GamesScreen() {
  const [filter, setFilter] = useState('upcoming')
  const { games, loading, refresh } = useGames(filter)
  const { profile } = useUser()
  const { bets } = useBets(profile?.id)

  const betGameIds = bets.map((b) => b.game_id)
  const displayGames = filter === 'upcoming'
    ? games.filter((g) => new Date(g.scheduled_at) > new Date())
    : games

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-3xl font-black text-[#1a2744]">Games</h1>
        <p className="text-[#6b7a99] mt-1">Place your predictions and climb the leaderboard</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all
              ${filter === f
                ? 'bg-[#1a2744] text-white shadow-lg shadow-[#1a2744]/10'
                : 'bg-[#f5f2ee] text-[#6b7a99] hover:bg-[#ece7e0] hover:text-[#1a2744] border border-[#e0dbd3]'}
            `}
          >
            {f}
          </button>
        ))}

        <button
          onClick={() => refresh()}
          className="ml-auto px-3 py-2 rounded-xl text-sm text-[#8a9ab0] hover:text-[#4a5a7a] bg-[#f5f2ee] hover:bg-[#ece7e0] transition-all border border-[#e0dbd3]"
          title="Refresh"
        >
          Refresh
        </button>
      </div>

      {/* Games grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-[#f5f2ee] h-52 animate-pulse" />
          ))}
        </div>
      ) : displayGames.length === 0 ? (
        <div className="text-center py-24 text-[#8a9ab0]">
          <div className="text-5xl mb-4">🏟️</div>
          <p className="font-semibold text-lg">No {filter} games</p>
          <p className="text-sm mt-1">Check back soon</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayGames.map((game) => (
            <GameCard key={game.id} game={game} userBetGameIds={betGameIds} />
          ))}
        </div>
      )}
    </div>
  )
}
