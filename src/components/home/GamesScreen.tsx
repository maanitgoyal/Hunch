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

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-3xl font-black text-white">Games</h1>
        <p className="text-gray-400 mt-1">Place your predictions and climb the leaderboard</p>
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
                ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-500/25'
                : 'bg-white/6 text-gray-400 hover:bg-white/10 hover:text-white border border-white/8'}
            `}
          >
            {f}
          </button>
        ))}

        <button
          onClick={() => refresh()}
          className="ml-auto px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10 transition-all border border-white/8"
          title="Refresh"
        >
          Refresh
        </button>
      </div>

      {/* Games grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/5 h-52 animate-pulse" />
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <div className="text-5xl mb-4">🏟️</div>
          <p className="font-semibold text-lg">No {filter} games</p>
          <p className="text-sm mt-1">Check back soon</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} userBetGameIds={betGameIds} />
          ))}
        </div>
      )}
    </div>
  )
}
