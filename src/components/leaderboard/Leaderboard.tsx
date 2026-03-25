import { useState, useEffect } from 'react'
import { getLeaderboard } from '../../lib/betting'
import { getCollegeLeaderboard } from '../../lib/lobbies'
import { useAuth } from '../../context/AuthContext'
import CollegeLogo from '../shared/CollegeLogo'
import { formatCoins, getRankDisplay } from '../../lib/utils'
import { supabase } from '../../lib/supabase'

const TABS = ['Overall', 'My College', 'Colleges']

interface TabBarProps {
  active: string
  onChange: (t: string) => void
}

function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1.5 mb-5 bg-white/5 p-1 rounded-xl">
      {TABS.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
            ${active === t
              ? 'bg-white text-black shadow-lg shadow-white/10'
              : 'text-gray-400 hover:text-white'}`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

interface PlayerRowProps {
  row: any
  rank: number
  isMe: boolean
}

function PlayerRow({ row, rank, isMe }: PlayerRowProps) {
  const { icon, class: rankClass } = getRankDisplay(rank)
  const streak = row.current_streak ?? 0
  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all
      ${isMe ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-white/5 border border-white/[0.06]'}
      ${rank <= 3 ? 'shadow-lg' : ''}`}
    >
      <div className={`w-8 text-center font-black text-lg ${rankClass}`}>{icon}</div>
      {row.avatar_emoji ? (
        <div
          className="rounded-xl flex items-center justify-center shrink-0 text-xl"
          style={{
            width: 36, height: 36,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {row.avatar_emoji}
        </div>
      ) : (
        <CollegeLogo
          college={{ logo_url: row.college_logo_url, primary_color: row.primary_color, abbreviation: row.college_abbreviation, name: row.college_name }}
          size={36}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={`font-bold text-sm truncate ${isMe ? 'text-yellow-300' : 'text-white'}`}>
            {row.display_name} {isMe && '(you)'}
          </p>
          {streak >= 3 && (
            <span className="text-xs font-bold text-orange-400 shrink-0" title={`${streak} win streak`}>
              🔥{streak}
            </span>
          )}
        </div>
        <p className="text-gray-500 text-xs truncate">{row.college_name}</p>
      </div>
      <div className="text-right">
        <p className="text-yellow-400 font-black text-sm">🪙 {formatCoins(row.coins)}</p>
        <p className="text-gray-500 text-xs">{row.total_wins}/{row.total_bets} · {row.win_rate}%</p>
      </div>
    </div>
  )
}

interface CollegeRowProps {
  row: any
  rank: number
  isMyCollege: boolean
}

function CollegeRow({ row, rank, isMyCollege }: CollegeRowProps) {
  const { icon, class: rankClass } = getRankDisplay(rank)
  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all
      ${isMyCollege ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-white/5 border border-white/[0.06]'}`}>
      <div className={`w-8 text-center font-black text-lg ${rankClass}`}>{icon}</div>
      <CollegeLogo
        college={{ logo_url: row.logo_url, primary_color: row.primary_color, abbreviation: row.abbreviation, name: row.name }}
        size={40}
      />
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{row.name}</p>
        <p className="text-gray-500 text-xs">{row.member_count} member{row.member_count !== 1 ? 's' : ''}</p>
      </div>
      <div className="text-right space-y-0.5">
        <p className="text-white font-black text-sm">
          {row.avg_win_rate != null ? `${row.avg_win_rate}%` : '—'}
          <span className="text-gray-600 font-normal text-xs ml-1">avg win rate</span>
        </p>
        <p className="text-yellow-400 text-xs font-semibold">
          🪙 {row.avg_coins != null ? formatCoins(row.avg_coins) : '—'}
          <span className="text-gray-600 font-normal ml-1">avg coins</span>
        </p>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const { profile } = useAuth()
  const [tab, setTab]             = useState('Overall')
  const [rows, setRows]           = useState<any[]>([])
  const [colleges, setColleges]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)

  async function load() {
    setLoading(true)
    const [{ data: players }, { data: cols }] = await Promise.all([
      getLeaderboard(),
      getCollegeLeaderboard(),
    ])
    setRows(players ?? [])
    setColleges(cols ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('leaderboard-rt')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const myRank = rows.findIndex((r) => r.user_id === profile?.id) + 1
  const myCollegeRank = colleges.findIndex((c) => c.name === profile?.colleges?.name) + 1
  const myCollegeData = myCollegeRank > 0 ? colleges[myCollegeRank - 1] : null

  const displayed = tab === 'My College'
    ? rows.filter((r) => r.college_name === profile?.colleges?.name)
    : rows

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Leaderboard</h1>
        <p className="text-gray-400 mt-1">Season standings</p>
      </div>

      {/* My position banner */}
      {profile && tab !== 'Colleges' && myRank > 0 && (
        <div className="mb-5 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-yellow-400 font-semibold text-sm">Your rank</span>
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-xl">#{myRank}</span>
            <span className="text-yellow-400 font-bold">🪙 {formatCoins(profile.coins)}</span>
          </div>
        </div>
      )}

      {profile && tab === 'Colleges' && myCollegeRank > 0 && myCollegeData && (
        <div className="mb-5 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CollegeLogo
              college={{ logo_url: myCollegeData.logo_url, primary_color: myCollegeData.primary_color, abbreviation: myCollegeData.abbreviation, name: myCollegeData.name }}
              size={28}
            />
            <span className="text-yellow-400 font-semibold text-sm">Your college</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-xl">#{myCollegeRank}</span>
            {myCollegeData.avg_win_rate != null && (
              <span className="text-yellow-400 font-bold text-sm">{myCollegeData.avg_win_rate}% win rate</span>
            )}
          </div>
        </div>
      )}

      <TabBar active={tab} onChange={setTab} />

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))
        ) : tab === 'Colleges' ? (
          colleges.length === 0
            ? <p className="text-center text-gray-500 py-10">No colleges yet.</p>
            : colleges.map((col, i) => (
                <CollegeRow key={col.id} row={col} rank={i + 1} isMyCollege={col.name === profile?.colleges?.name} />
              ))
        ) : displayed.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No players yet.</p>
        ) : (
          displayed.map((row, idx) => {
            const globalRank = rows.findIndex((r) => r.user_id === row.user_id) + 1
            const rank = tab === 'My College' ? idx + 1 : globalRank
            return (
              <PlayerRow
                key={row.user_id}
                row={row}
                rank={rank}
                isMe={row.user_id === profile?.id}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
