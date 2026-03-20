import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ScoreEntry({ game, onDone }) {
  const homeAbbr = game.home_college?.abbreviation ?? 'Home'
  const awayAbbr = game.away_college?.abbreviation ?? 'Away'

  const [homeScore, setHomeScore] = useState(game.home_score ?? '')
  const [awayScore, setAwayScore] = useState(game.away_score ?? '')
  const [busy, setBusy]           = useState(false)
  const [msg, setMsg]             = useState('')

  async function handleResolve(e) {
    e.preventDefault()
    if (homeScore === '' || awayScore === '') { setMsg('Enter both scores'); return }
    setBusy(true)
    setMsg('')

    // First lock all open markets for this game
    await supabase
      .from('bet_markets')
      .update({ status: 'locked' })
      .eq('game_id', game.id)
      .eq('status', 'open')

    // Call resolve_game database function
    const { data, error } = await supabase.rpc('resolve_game', {
      p_game_id:    game.id,
      p_home_score: Number(homeScore),
      p_away_score: Number(awayScore),
    })

    setBusy(false)
    if (error) { setMsg(`Error: ${error.message}`); return }
    if (data?.error) { setMsg(`Error: ${data.error}`); return }

    setMsg(`Done! ${data.bets_resolved} bet(s) resolved.`)
    setTimeout(() => { setMsg(''); onDone() }, 3000)
  }

  async function handleCancel() {
    if (!confirm('Cancel this game and refund all bets?')) return
    setBusy(true)
    const { data, error } = await supabase.rpc('cancel_game', { p_game_id: game.id })
    setBusy(false)
    if (error) { setMsg(`Error: ${error.message}`); return }
    setMsg(`Game cancelled. ${data.bets_refunded} bet(s) refunded.`)
    setTimeout(() => { setMsg(''); onDone() }, 3000)
  }

  const inputCls = "w-full px-3 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-2xl font-black text-center focus:outline-none focus:border-yellow-400 transition-colors"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold">Enter Final Score</h3>
        <button onClick={onDone} className="text-gray-400 text-sm hover:text-white">← Back</button>
      </div>

      <form onSubmit={handleResolve} className="bg-white/5 rounded-2xl p-4 space-y-4 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block text-center">{homeAbbr}</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="text-gray-500 font-black text-xl pb-4">–</div>
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block text-center">{awayAbbr}</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        {msg && <p className={`text-sm text-center ${msg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{msg}</p>}

        <button
          type="submit"
          disabled={busy || game.status === 'completed'}
          className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold disabled:opacity-50"
        >
          {busy ? 'Resolving…' : game.status === 'completed' ? 'Already resolved' : '⚡ Resolve & Settle Bets'}
        </button>

        {game.status !== 'completed' && game.status !== 'cancelled' && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={busy}
            className="w-full py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-400/30 text-sm font-semibold disabled:opacity-50"
          >
            Cancel game & refund all bets
          </button>
        )}
      </form>
    </div>
  )
}
