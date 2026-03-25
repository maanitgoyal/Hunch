import { useAuth } from '../../context/AuthContext'
import { useBets } from '../../hooks/useBets'
import { formatCoins } from '../../lib/utils'
import { claimBailout } from '../../lib/betting'
import { useState } from 'react'
import Avatar from '../shared/Avatar'

export default function UserInfoCard() {
  const { profile, refreshProfile } = useAuth()
  const { bets } = useBets(profile?.id)
  const [claiming, setClaiming] = useState(false)
  const [bailoutMsg, setBailoutMsg] = useState('')

  if (!profile) return null

  const won     = bets.filter((b) => b.status === 'won').length
  const lost    = bets.filter((b) => b.status === 'lost').length
  const pending = bets.filter((b) => b.status === 'pending').length
  const settled = won + lost
  const winRate = settled > 0 ? Math.round((won / settled) * 100) : null

  async function handleBailout() {
    setClaiming(true)
    setBailoutMsg('')
    const { error } = await claimBailout(profile!.id)
    setClaiming(false)
    if (error) {
      setBailoutMsg((error as any).message)
    } else {
      await refreshProfile()
      setBailoutMsg('100 coins granted!')
    }
    setTimeout(() => setBailoutMsg(''), 3000)
  }

  return (
    <div className="flex items-center gap-5">
      <Avatar profile={profile} size={80} />

      {/* Info */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <div>
          <p className="text-white font-black text-xl leading-tight truncate">{profile.display_name}</p>
          <p className="text-gray-400 text-sm truncate">{profile.colleges?.name ?? 'No college'}</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap mt-0.5">
          <span className="flex items-center gap-1 font-bold text-base">
            <span className="text-yellow-400">🪙</span>
            <span className="text-yellow-300">{formatCoins(profile.coins)}</span>
          </span>

          {settled > 0 && (
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <span className="text-green-400">{won}W</span>
              <span className="text-gray-600">·</span>
              <span className="text-red-400">{lost}L</span>
              {winRate !== null && (
                <>
                  <span className="text-gray-600">·</span>
                  <span className="text-white">{winRate}%</span>
                </>
              )}
            </span>
          )}

          {pending > 0 ? (
            <span className="text-[11px] text-gray-500">{pending} pending</span>
          ) : settled === 0 ? (
            <span className="text-gray-600 text-sm">No bets yet</span>
          ) : null}
        </div>

        {bailoutMsg && <span className="text-yellow-300 text-xs">{bailoutMsg}</span>}

        {profile.coins < 10 && (
          <button
            onClick={handleBailout}
            disabled={claiming}
            className="mt-0.5 self-start px-3 py-1 rounded-lg text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-400/25 hover:bg-yellow-500/25 transition-all disabled:opacity-50"
          >
            {claiming ? 'Claiming...' : 'Claim Bailout (100 coins)'}
          </button>
        )}
      </div>
    </div>
  )
}
