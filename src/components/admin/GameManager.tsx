import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatGameTime } from '../../lib/utils'

const SPORTS = ['Basketball', 'Volleyball', 'Football', 'Soccer', 'Cricket', 'Rugby', 'Tennis', 'Netball']
const GAME_TYPES = [
  { value: 'regular_season', label: 'Regular Season' },
  { value: 'playoff_semi',   label: 'Playoffs - Semi Final' },
  { value: 'playoff_final',  label: 'Playoffs - Grand Final' },
]

interface GameManagerProps {
  onSelectGame: (game: any) => void
}

export default function GameManager({ onSelectGame }: GameManagerProps) {
  const [colleges, setColleges] = useState<any[]>([])
  const [games, setGames]       = useState<any[]>([])
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

  async function handleCreate(e: React.FormEvent) {
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

  function field(key: string, val: string) { setForm((f) => ({ ...f, [key]: val })) }

  const inputCls = "w-full px-3 py-2 rounded-lg bg-white border border-[#e0dbd3] text-[#1a2744] text-sm focus:outline-none focus:border-[#2563eb] transition-colors"
  const selectCls = "w-full px-3 py-2 rounded-lg bg-white border border-[#e0dbd3] text-[#1a2744] text-sm focus:outline-none focus:border-[#2563eb] transition-colors"

  return (
    <div className="space-y-6">
      {/* Create game form */}
      <form onSubmit={handleCreate} className="bg-white rounded-2xl p-4 space-y-3 border border-[#e0dbd3]">
        <h3 className="text-[#1a2744] font-bold">Create Game</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#6b7a99] mb-1 block">Home College</label>
            <select className={selectCls} value={form.home_college_id} onChange={(e) => field('home_college_id', e.target.value)} required>
              <option value="">Select…</option>
              {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6b7a99] mb-1 block">Away College</label>
            <select className={selectCls} value={form.away_college_id} onChange={(e) => field('away_college_id', e.target.value)} required>
              <option value="">Select…</option>
              {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#6b7a99] mb-1 block">Sport</label>
            <select className={selectCls} value={form.sport} onChange={(e) => field('sport', e.target.value)}>
              {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6b7a99] mb-1 block">Game Type</label>
            <select className={selectCls} value={form.game_type} onChange={(e) => field('game_type', e.target.value)}>
              {GAME_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-[#6b7a99] mb-1 block">Date & Time</label>
          <input type="datetime-local" className={inputCls} value={form.scheduled_at} onChange={(e) => field('scheduled_at', e.target.value)} required />
        </div>

        {msg && <p className={`text-sm ${msg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}

        <button type="submit" disabled={busy} className="w-full py-2 rounded-xl bg-[#1a2744] text-white font-bold text-sm disabled:opacity-50 hover:bg-[#243060] transition-colors">
          {busy ? 'Creating…' : '+ Create Game'}
        </button>
      </form>

      {/* Games list */}
      <div className="space-y-2">
        <h3 className="text-[#1a2744] font-bold text-sm">Recent Games</h3>
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelectGame(g)}
            className="w-full text-left bg-white border border-[#e0dbd3] rounded-xl px-4 py-3 hover:bg-[#f5f2ee] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[#1a2744] text-sm font-semibold">
                {g.home_college?.abbreviation} vs {g.away_college?.abbreviation}
              </span>
              <span className={`text-xs font-bold ${g.status === 'upcoming' ? 'text-blue-500' : g.status === 'live' ? 'text-green-500' : 'text-[#8a9ab0]'}`}>
                {g.status}
              </span>
            </div>
            <p className="text-[#6b7a99] text-xs mt-0.5">
              {g.sport} · {formatGameTime(g.scheduled_at)} · {g.bet_markets?.length ?? 0} markets
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
