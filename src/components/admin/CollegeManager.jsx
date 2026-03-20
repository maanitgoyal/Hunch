import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import CollegeLogo from '../shared/CollegeLogo'

export default function CollegeManager() {
  const [colleges, setColleges] = useState([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg]   = useState('')
  const [form, setForm] = useState({
    name: '', abbreviation: '', primary_color: '#1a1a2e', secondary_color: '#16213e', logo_url: '',
  })

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('colleges').select('*').order('name')
    setColleges(data ?? [])
  }

  async function handleCreate(e) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const { error } = await supabase.from('colleges').insert({
      name:            form.name.trim(),
      abbreviation:    form.abbreviation.trim().toUpperCase(),
      primary_color:   form.primary_color,
      secondary_color: form.secondary_color,
      logo_url:        form.logo_url.trim() || null,
    })
    setBusy(false)
    if (error) { setMsg(`Error: ${error.message}`); return }
    setMsg('College added!')
    setForm({ name: '', abbreviation: '', primary_color: '#1a1a2e', secondary_color: '#16213e', logo_url: '' })
    load()
    setTimeout(() => setMsg(''), 3000)
  }

  function field(key, val) { setForm((f) => ({ ...f, [key]: val })) }

  const inputCls = "w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"

  return (
    <div className="space-y-5">
      {/* Add college form */}
      <form onSubmit={handleCreate} className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/10">
        <h3 className="text-white font-bold text-sm">Add College</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Full name</label>
            <input className={inputCls} value={form.name} onChange={(e) => field('name', e.target.value)} placeholder="St Paul's" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Abbreviation</label>
            <input className={inputCls} value={form.abbreviation} onChange={(e) => field('abbreviation', e.target.value)} placeholder="SPC" maxLength={5} required />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Logo URL (optional)</label>
          <input className={inputCls} value={form.logo_url} onChange={(e) => field('logo_url', e.target.value)} placeholder="https://…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Primary color</label>
            <div className="flex gap-2">
              <input type="color" value={form.primary_color} onChange={(e) => field('primary_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
              <input className={`${inputCls} flex-1`} value={form.primary_color} onChange={(e) => field('primary_color', e.target.value)} placeholder="#8B0000" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Secondary color</label>
            <div className="flex gap-2">
              <input type="color" value={form.secondary_color} onChange={(e) => field('secondary_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
              <input className={`${inputCls} flex-1`} value={form.secondary_color} onChange={(e) => field('secondary_color', e.target.value)} placeholder="#4a0000" />
            </div>
          </div>
        </div>
        {msg && <p className={`text-sm ${msg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{msg}</p>}
        <button type="submit" disabled={busy} className="w-full py-2 rounded-xl bg-yellow-400 text-black font-bold text-sm disabled:opacity-50">
          {busy ? 'Adding…' : '+ Add College'}
        </button>
      </form>

      {/* College list */}
      <div className="space-y-2">
        <h3 className="text-white font-bold text-sm">Colleges ({colleges.length})</h3>
        {colleges.map((c) => (
          <div key={c.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
            <CollegeLogo college={c} size={36} />
            <div>
              <p className="text-white text-sm font-semibold">{c.name}</p>
              <p className="text-gray-400 text-xs">{c.abbreviation}</p>
            </div>
            <div className="ml-auto flex gap-1">
              <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c.primary_color }} />
              <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c.secondary_color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
