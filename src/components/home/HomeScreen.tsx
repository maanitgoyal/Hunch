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
  const upcomingGames = games.filter((g) => new Date(g.scheduled_at) > new Date())

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-black text-[#1a2744]">
          {profile ? `Hey, ${profile.display_name.split(' ')[0]} 👋` : 'Welcome back'}
        </h1>
        <p className="text-[#6b7a99] mt-1">Here's what's happening today</p>
      </div>

      {/* User info */}
      <UserInfoCard />

      {/* Promo banners */}
      <PromoBanner />

      {/* Upcoming games preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-[#1a2744]">Upcoming Games</h2>
          <button
            onClick={() => navigate('/games')}
            className="text-sm text-white/60 hover:text-[#1a2744] font-semibold transition-colors"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-[#f5f2ee] h-52 animate-pulse" />
            ))}
          </div>
        ) : upcomingGames.length === 0 ? (
          <div className="text-center py-16 text-[#8a9ab0]">
            <div className="text-5xl mb-4">🏟️</div>
            <p className="font-semibold text-lg">No upcoming games</p>
            <p className="text-sm mt-1">Check back soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingGames.map((game) => (
              <GameCard key={game.id} game={game} userBetGameIds={betGameIds} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
