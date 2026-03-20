import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatGameTime } from '../../lib/utils'

const SPORTS = ['Basketball', 'Volleyball', 'Football', 'Soccer', 'Cricket', 'Rugby', 'Tennis', 'Netball']
const GAME_TYPES = [
  { value: 'regular_season', label: 'Regular Season' },
  { value: 'playoff_semi',   label: 'Playoffs - Semi Final' },
  { value: 'playoff_final',  label: 'Playoffs - Grand Final' },
]

export default function GameManager({ onSelectGame }) {
  const [colleges, setColleges] = useState([])
  const [games, setGames]       = useState([])
  const [busy, setBusy]         = useState(false)
  const [msg, setMsg]           = useState('')

  const [form, setForm] = useState({
    home_college_id: '',
    away_college_id: '',
    sport: 'Basketball',
    game_type: 'regular_season',
    scheduled_at: '',
  })

  useEffect(() => {
    supabase.from('colleges').select('*').order('name').then(({ data }) => setColleges(data ?? []))
    loadGames()
  }, [])

  async function loadGames() {
    const { data } = await supabase
      .from('games')
      .select(`
        *,
        home_college:colleges!games_home_college_id_fkey(name,abbreviation),
        away_college:colleges!games_away_college_id_fkey(name,abbreviation),
        bet_markets(id)
      `)
      .order('scheduled_at', { ascending: false })
      .limit(20)
    setGames(data ?? [])
  }

  async function handleCreate(e) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const { error } = await supabase.from('games').insert({
      home_college_id: form.home_college_id,
      away_college_id: form.away_college_id,
      sport:           form.sport,
      game_type:       form.game_type,
      scheduled_at:    form.scheduled_at,
    })
    setBusy(false)
    if (error) { setMsg(`Error: ${error.message}`); return }
    setMsg('Game created!')
    setForm({ home_college_id: '', away_college_id: '', sport: 'Basketball', game_type: 'regular_season', scheduled_at: '' })
    loadGames()
    setTimeout(() => setMsg(''), 3000)
  }

  function field(key, val) { setForm((f) => ({ ...f, [key]: val })) }

  const inputCls = "w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"
  const selectCls = "w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border border-white/20 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"

  return (
    <div className="space-y-6">
      {/* Create game form */}
      <form onSubmit={handleCreate} className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/10">
        <h3 className="text-white font-bold">Create Game</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Home College</label>
            <select className={selectCls} value={form.home_college_id} onChange={(e) => field('home_college_id', e.target.value)} required>
              <option value="">Select…</option>
              {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Away College</label>
            <select className={selectCls} value={form.away_college_id} onChange={(e) => field('away_college_id', e.target.value)} required>
              <option value="">Select…</option>
              {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Sport</label>
            <select className={selectCls} value={form.sport} onChange={(e) => field('sport', e.target.value)}>
              {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Game Type</label>
            <select className={selectCls} value={form.game_type} onChange={(e) => field('game_type', e.target.value)}>
              {GAME_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Date & Time</label>
          <input type="datetime-local" className={inputCls} value={form.scheduled_at} onChange={(e) => field('scheduled_at', e.target.value)} required />
        </div>

        {msg && <p className={`text-sm ${msg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{msg}</p>}

        <button type="submit" disabled={busy} className="w-full py-2 rounded-xl bg-yellow-400 text-black font-bold text-sm disabled:opacity-50">
          {busy ? 'Creating…' : '+ Create Game'}
        </button>
      </form>

      {/* Games list */}
      <div className="space-y-2">
        <h3 className="text-white font-bold text-sm">Recent Games</h3>
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelectGame(g)}
            className="w-full text-left bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-semibold">
                {g.home_college?.abbreviation} vs {g.away_college?.abbreviation}
              </span>
              <span className={`text-xs font-bold ${g.status === 'upcoming' ? 'text-blue-400' : g.status === 'live' ? 'text-green-400' : 'text-gray-400'}`}>
                {g.status}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">
              {g.sport} · {formatGameTime(g.scheduled_at)} · {g.bet_markets?.length ?? 0} markets
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
