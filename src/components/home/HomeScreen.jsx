import { useNavigate } from 'react-router-dom'
import { useGames } from '../../hooks/useGames'
import { useUser } from '../../hooks/useUser'
import { useBets } from '../../hooks/useBets'
import UserInfoCard from './UserInfoCard'
import GameCard from './GameCard'
import PromoBanner from './PromoBanner'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { games, loading } = useGames('upcoming')
  const { profile } = useUser()
  const { bets } = useBets(profile?.id)

  const betGameIds = bets.map((b) => b.game_id)

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-black text-white">
          {profile ? `Hey, ${profile.display_name.split(' ')[0]} 👋` : 'Welcome back'}
        </h1>
        <p className="text-gray-400 mt-1">Here's what's happening today</p>
      </div>

      {/* User info */}
      <UserInfoCard />

      {/* Promo banners */}
      <PromoBanner />

      {/* Upcoming games preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white">Upcoming Games</h2>
          <button
            onClick={() => navigate('/games')}
            className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 h-52 animate-pulse" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">🏟️</div>
            <p className="font-semibold text-lg">No upcoming games</p>
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
    </div>
  )
}
