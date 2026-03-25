import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const MARKET_TEMPLATES: Record<string, (homeAbbr: string, awayAbbr: string) => { description: string; options: any[] }> = {
  winner: (homeAbbr, awayAbbr) => ({
    description: 'Who will win?',
    options: [
      { key: 'home', label: `${homeAbbr} to win`, odds: 1.9 },
      { key: 'draw', label: 'Draw',               odds: 3.2 },
      { key: 'away', label: `${awayAbbr} to win`, odds: 1.9 },
    ],
  }),
  margin_range: () => ({
    description: 'Winning margin (goals) (refunded if draw)',
    options: [
      { key: '1_2',    label: '1-2 goals', odds: 2.0 },
      { key: '3_5',    label: '3-5 goals', odds: 2.5 },
      { key: '6_plus', label: '6+ goals',  odds: 4.0 },
    ],
  }),
  total_points_over_under: () => ({
    description: 'Total goals over/under 2.5',
    options: [
      { key: 'over',  label: 'Over 2.5',  odds: 1.9, line: 2.5 },
      { key: 'under', label: 'Under 2.5', odds: 1.9, line: 2.5 },
    ],
  }),
  first_to_score: (homeAbbr, awayAbbr) => ({
    description: 'Who scores first?',
    options: [
      { key: 'home', label: `${homeAbbr} first`, odds: 1.8 },
      { key: 'away', label: `${awayAbbr} first`, odds: 2.0 },
    ],
  }),
}

interface MarketManagerProps {
  game: any
  onDone: () => void
}

export default function MarketManager({ game, onDone }: MarketManagerProps) {
  const homeAbbr = game.home_college?.abbreviation ?? 'Home'
  const awayAbbr = game.away_college?.abbreviation ?? 'Away'

  const [marketType, setMarketType]   = useState('winner')
  const [optionsJson, setOptionsJson] = useState(
    JSON.stringify(MARKET_TEMPLATES.winner(homeAbbr, awayAbbr).options, null, 2)
  )
  const [description, setDescription] = useState(MARKET_TEMPLATES.winner(homeAbbr, awayAbbr).description)
  const [locksAt, setLocksAt]         = useState(game.scheduled_at?.slice(0, 16) ?? '')
  const [busy, setBusy]               = useState(false)
  const [msg, setMsg]                 = useState('')
  const [markets, setMarkets]         = useState<any[]>(game.bet_markets ?? [])

  function applyTemplate(type: string) {
    setMarketType(type)
    const tmpl = MARKET_TEMPLATES[type]?.(homeAbbr, awayAbbr)
    if (tmpl) {
      setDescription(tmpl.description)
      setOptionsJson(JSON.stringify(tmpl.options, null, 2))
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    let parsedOptions
    try {
      parsedOptions = JSON.parse(optionsJson)
    } catch {
      setMsg('Invalid JSON in options')
      setBusy(false)
      return
    }
    const { error } = await supabase.from('bet_markets').insert({
      game_id:     game.id,
      market_type: marketType,
      description,
      options:     parsedOptions,
      locks_at:    locksAt,
    })
    setBusy(false)
    if (error) { setMsg(`Error: ${error.message}`); return }
    setMsg('Market created!')

    const { data } = await supabase.from('bet_markets').select('*').eq('game_id', game.id)
    setMarkets(data ?? [])
    setTimeout(() => setMsg(''), 3000)
  }

  const inputCls = "w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold">
          Markets: {homeAbbr} vs {awayAbbr}
        </h3>
        <button onClick={onDone} className="text-gray-400 text-sm hover:text-white">← Back</button>
      </div>

      {/* Existing markets */}
      {markets.length > 0 && (
        <div className="space-y-2">
          {markets.map((m) => (
            <div key={m.id} className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
              <div className="flex justify-between items-center">
                <p className="text-white text-sm font-semibold">{m.description}</p>
                <span className={`text-xs font-bold ${m.status === 'open' ? 'text-green-400' : m.status === 'resolved' ? 'text-gray-400' : 'text-red-400'}`}>
                  {m.status}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-0.5">{m.market_type}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/10">
        <h4 className="text-white font-bold text-sm">Add Market</h4>

        {/* Quick templates */}
        <div className="flex flex-wrap gap-2">
          {Object.keys(MARKET_TEMPLATES).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => applyTemplate(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
                ${marketType === t ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
            >
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Description</label>
          <input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Options JSON</label>
          <textarea
            className={`${inputCls} font-mono text-xs`}
            rows={8}
            value={optionsJson}
            onChange={(e) => setOptionsJson(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Locks at (game start)</label>
          <input type="datetime-local" className={inputCls} value={locksAt} onChange={(e) => setLocksAt(e.target.value)} required />
        </div>

        {msg && <p className={`text-sm ${msg.startsWith('Error') || msg.startsWith('Invalid') ? 'text-red-400' : 'text-green-400'}`}>{msg}</p>}

        <button type="submit" disabled={busy} className="w-full py-2 rounded-xl bg-yellow-400 text-black font-bold text-sm disabled:opacity-50">
          {busy ? 'Creating…' : '+ Add Market'}
        </button>
      </form>
    </div>
  )
}
