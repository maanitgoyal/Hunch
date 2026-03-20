import { useState } from 'react'
import GameManager from './GameManager'
import MarketManager from './MarketManager'
import ScoreEntry from './ScoreEntry'
import { useAuth } from '../../context/AuthContext'
import { signOut } from '../../lib/auth'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import CollegeManager from './CollegeManager'

const TABS = ['Games', 'Colleges']

export default function AdminPanel() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Games')

  // Game-level sub-views: null | 'markets' | 'score'
  const [selectedGame, setSelectedGame] = useState(null)
  const [subView, setSubView]           = useState(null)

  function handleSelectGame(game) {
    setSelectedGame(game)
    setSubView(null) // show sub-options
  }

  function clearGame() {
    setSelectedGame(null)
    setSubView(null)
  }

  return (
    <div className="min-h-full bg-[#0f0f1a] pt-4">
      {/* Header */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Hunch Admin</h1>
          <p className="text-gray-400 text-sm">{profile?.display_name}</p>
        </div>
        <button
          onClick={async () => { await signOut(); navigate('/login') }}
          className="text-sm text-gray-400 hover:text-white"
        >
          Sign out
        </button>
      </div>

      {/* Tabs */}
      {!selectedGame && (
        <div className="px-4 mb-4 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all
                ${tab === t ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-400 hover:bg-white/15'}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pb-8">
        {/* Games tab */}
        {tab === 'Games' && !selectedGame && (
          <GameManager onSelectGame={handleSelectGame} />
        )}

        {/* Game selected — show options */}
        {tab === 'Games' && selectedGame && !subView && (
          <div className="space-y-3">
            <button onClick={clearGame} className="text-gray-400 text-sm hover:text-white">← All Games</button>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <p className="text-white font-bold">
                {selectedGame.home_college?.abbreviation} vs {selectedGame.away_college?.abbreviation}
              </p>
              <p className="text-gray-400 text-xs">{selectedGame.sport} · {selectedGame.status}</p>
            </div>
            <button
              onClick={() => setSubView('markets')}
              className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15 transition-colors text-sm"
            >
              📊 Manage Markets
            </button>
            <button
              onClick={() => setSubView('score')}
              className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15 transition-colors text-sm"
            >
              ⚡ Enter Scores & Resolve
            </button>
          </div>
        )}

        {/* Markets sub-view */}
        {tab === 'Games' && selectedGame && subView === 'markets' && (
          <MarketManager
            game={selectedGame}
            onDone={() => setSubView(null)}
          />
        )}

        {/* Score entry sub-view */}
        {tab === 'Games' && selectedGame && subView === 'score' && (
          <ScoreEntry
            game={selectedGame}
            onDone={clearGame}
          />
        )}

        {/* Colleges tab */}
        {tab === 'Colleges' && <CollegeManager />}
      </div>
    </div>
  )
}
