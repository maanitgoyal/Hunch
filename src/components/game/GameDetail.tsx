import { useParams, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useGame } from '../../hooks/useGames'
import { useBets } from '../../hooks/useBets'
import { useUser } from '../../hooks/useUser'
import CollegeLogo from '../shared/CollegeLogo'
import MarketCard from './MarketCard'
import { formatGameTime, getSportEmoji, hexToRgb, GAME_STATUS_COLORS } from '../../lib/utils'
import { getRivalryRecord, submitPrediction, getGamePredictions, getMyPrediction } from '../../lib/minigames'

// ─── Prediction poll ────────────────────────────────────────
interface PredictionPollProps {
  game: any
  userId: string
}

function PredictionPoll({ game, userId }: PredictionPollProps) {
  const [mine, setMine]       = useState<string | null | undefined>(undefined)
  const [counts, setCounts]   = useState<any>(null)
  const [busy, setBusy]       = useState(false)

  useEffect(() => {
    Promise.all([
      getMyPrediction(game.id, userId),
      getGamePredictions(game.id),
    ]).then(([{ data: myPred }, { data: all }]) => {
      setMine(myPred ? myPred.predicted_winner_id : null)
      if (all) buildCounts(all, game)
    })
  }, [game.id, userId])

  function buildCounts(rows: any[], g: any) {
    const c: Record<string, number> = { [g.home_college_id]: 0, [g.away_college_id]: 0, draw: 0 }
    rows.forEach((r) => {
      const k = r.predicted_winner_id ?? 'draw'
      if (k in c) c[k]++
    })
    setCounts({ ...c, total: rows.length })
  }

  async function vote(winnerId: string | null) {
    if (busy || mine !== null) return
    setBusy(true)
    await submitPrediction({ gameId: game.id, userId, predictedWinnerId: winnerId })
    setMine(winnerId)
    const { data } = await getGamePredictions(game.id)
    if (data) buildCounts(data, game)
    setBusy(false)
  }

  if (mine === undefined) return null

  const options = [
    { id: game.home_college_id, label: game.home_college?.abbreviation, college: game.home_college },
    { id: null,                  label: 'Draw',                          college: null },
    { id: game.away_college_id, label: game.away_college?.abbreviation, college: game.away_college },
  ]

  const hasVoted = mine !== undefined && mine !== null
  const total = counts?.total ?? 0

  return (
    <div className="mx-4 mb-4 rounded-2xl bg-black/30 border border-white/10 p-4">
      <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
        Who do you think will win? (no coins)
      </p>
      <div className="flex gap-2">
        {options.map((opt) => {
          const key = opt.id ?? 'draw'
          const isMyPick = hasVoted && mine === opt.id
          const pct = (hasVoted && total > 0)
            ? Math.round(((counts?.[key] ?? 0) / total) * 100)
            : null

          return (
            <button
              key={key}
              onClick={() => vote(opt.id)}
              disabled={hasVoted || busy}
              className={`flex-1 relative rounded-xl py-2.5 px-2 text-center transition-all overflow-hidden
                ${isMyPick ? 'border-2 border-white/60 bg-white/10' : 'border border-white/10 bg-white/5 hover:bg-white/10'}
                ${hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {/* Progress fill */}
              {hasVoted && pct !== null && (
                <div
                  className="absolute inset-y-0 left-0 bg-white/5 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative">
                {opt.college && <CollegeLogo college={opt.college} size={24} className="mx-auto mb-1" />}
                <p className="text-xs font-bold text-white">{opt.label}</p>
                {hasVoted && <p className="text-gray-400 text-[10px] mt-0.5">{pct}%</p>}
              </div>
            </button>
          )
        })}
      </div>
      {hasVoted && <p className="text-gray-600 text-[10px] text-center mt-2">{total} prediction{total !== 1 ? 's' : ''}</p>}
    </div>
  )
}

// ─── Rivalry tracker ────────────────────────────────────────
interface RivalryBadgeProps {
  homeCollege: any
  awayCollege: any
}

function RivalryBadge({ homeCollege, awayCollege }: RivalryBadgeProps) {
  const [record, setRecord] = useState<any>(null)

  useEffect(() => {
    if (!homeCollege?.id || !awayCollege?.id) return
    getRivalryRecord(homeCollege.id, awayCollege.id).then(({ data }) => setRecord(data))
  }, [homeCollege?.id, awayCollege?.id])

  if (!record || record.total === 0) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-3 py-2 px-4 rounded-full bg-black/30 border border-white/10 mx-auto w-fit">
      <span className="text-white/60 text-xs font-semibold">Head to Head</span>
      <span className="text-white font-black text-sm">
        {record.winsA} - {record.draws} - {record.winsB}
      </span>
      <span className="text-white/40 text-[10px]">({record.total} games)</span>
    </div>
  )
}

export default function GameDetail() {
  const { id } = useParams()
  const { game, loading, refresh } = useGame(id)
  const { profile, refreshProfile } = useUser()
  const { bets, refresh: refreshBets } = useBets(profile?.id)

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center text-gray-400">
        Game not found.
      </div>
    )
  }

  const { home_college, away_college } = game
  const homeRgb = hexToRgb(home_college?.primary_color ?? '#1a1a2e')
  const awayRgb = hexToRgb(away_college?.primary_color ?? '#16213e')
  const statusColor = GAME_STATUS_COLORS[game.status] ?? 'text-gray-400'

  const betsByMarket: Record<string, any[]> = {}
  bets.forEach((b) => {
    if (!betsByMarket[b.market_id]) betsByMarket[b.market_id] = []
    betsByMarket[b.market_id].push(b)
  })

  function handleBetPlaced() {
    refresh()
    refreshBets()
    refreshProfile()
  }

  return (
    <div className="min-h-full bg-transparent">
      {/* Header */}
      <div
        style={{ background: `linear-gradient(135deg, rgba(${homeRgb},0.9) 0%, rgba(${awayRgb},0.9) 100%)` }}
        className="relative pt-safe pb-6 px-4"
      >
        <NavLink to="/" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium mb-4 mt-2 transition-colors">
          ← Back to Games
        </NavLink>

        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-semibold uppercase tracking-wider ${statusColor}`}>
            {game.status === 'live' && (
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
            )}
            {game.status}
          </span>
          <span className="text-xs bg-black/30 text-white rounded-full px-3 py-1 font-medium">
            {getSportEmoji(game.sport)} {game.sport}
          </span>
        </div>

        {/* Teams + score */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2 flex-1">
            <CollegeLogo college={home_college} size={72} />
            <span className="text-white font-bold text-base text-center">{home_college?.name}</span>
            {(game.status === 'completed' || game.status === 'live') && (
              <span className="text-4xl font-black text-white">{game.home_score ?? '-'}</span>
            )}
          </div>

          <div className="flex flex-col items-center px-2">
            {game.status === 'completed' ? (
              <>
                <span className="text-white/60 text-xs font-semibold uppercase">Final</span>
                {game.winning_college && (
                  <span className="text-yellow-400 text-xs mt-1 font-bold">
                    {game.winning_college_id === game.home_college_id
                      ? home_college?.abbreviation
                      : away_college?.abbreviation} WIN
                  </span>
                )}
              </>
            ) : (
              <span className="text-white/60 font-black text-xl">VS</span>
            )}
            <span className="text-white/50 text-xs mt-2 text-center">
              {formatGameTime(game.scheduled_at)}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 flex-1">
            <CollegeLogo college={away_college} size={72} />
            <span className="text-white font-bold text-base text-center">{away_college?.name}</span>
            {(game.status === 'completed' || game.status === 'live') && (
              <span className="text-4xl font-black text-white">{game.away_score ?? '-'}</span>
            )}
          </div>
        </div>

        {/* Rivalry record */}
        <RivalryBadge homeCollege={home_college} awayCollege={away_college} />
      </div>

      {/* Prediction poll */}
      {game.status === 'upcoming' && profile?.id && (
        <PredictionPoll game={game} userId={profile.id} />
      )}

      {/* Markets */}
      <div className="px-4 py-5 space-y-4">
        <h2 className="text-white font-bold text-lg">Bet Markets</h2>

        {game.bet_markets?.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p>No markets available for this game yet.</p>
          </div>
        )}

        {game.bet_markets?.map((market: any) => (
          <MarketCard
            key={market.id}
            market={{ ...market, game_id: game.id }}
            existingBets={betsByMarket[market.id] ?? []}
            userCoins={profile?.coins ?? 0}
            onBetPlaced={handleBetPlaced}
          />
        ))}
      </div>
    </div>
  )
}
