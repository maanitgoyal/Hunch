import { useState } from 'react'
import GameManager from './GameManager'
import MarketManager from './MarketManager'
import ScoreEntry from './ScoreEntry'
import { useAuth } from '../../context/AuthContext'
import { signOut } from '../../lib/auth'
import { useNavigate } from 'react-router-dom'
import CollegeManager from './CollegeManager'

const TABS = ['Games', 'Colleges']

export default function AdminPanel() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Games')

  const [selectedGame, setSelectedGame] = useState<any | null>(null)
  const [subView, setSubView]           = useState<string | null>(null)

  function handleSelectGame(game: any) {
    setSelectedGame(game)
    setSubView(null)
  }

  function clearGame() {
    setSelectedGame(null)
    setSubView(null)
  }

  return (
    <div className="min-h-full bg-[#ede8e1] pt-4">
      {/* Header */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1a2744]">Hunch Admin</h1>
          <p className="text-[#6b7a99] text-sm">{profile?.display_name}</p>
        </div>
        <button
          onClick={async () => { await signOut(); navigate('/login') }}
          className="text-sm text-[#6b7a99] hover:text-[#1a2744] transition-colors"
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
                ${tab === t ? 'bg-[#1a2744] text-white' : 'bg-white text-[#6b7a99] border border-[#e0dbd3] hover:bg-[#f5f2ee]'}`}
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
            <button onClick={clearGame} className="text-[#6b7a99] text-sm hover:text-[#1a2744] transition-colors">← All Games</button>
            <div className="bg-white border border-[#e0dbd3] rounded-xl px-4 py-3">
              <p className="text-[#1a2744] font-bold">
                {selectedGame.home_college?.abbreviation} vs {selectedGame.away_college?.abbreviation}
              </p>
              <p className="text-[#6b7a99] text-xs">{selectedGame.sport} · {selectedGame.status}</p>
            </div>
            <button
              onClick={() => setSubView('markets')}
              className="w-full py-3 rounded-xl bg-white border border-[#e0dbd3] text-[#1a2744] font-semibold hover:bg-[#f5f2ee] transition-colors text-sm"
            >
              📊 Manage Markets
            </button>
            <button
              onClick={() => setSubView('score')}
              className="w-full py-3 rounded-xl bg-[#1a2744] text-white font-semibold hover:bg-[#243060] transition-colors text-sm"
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
