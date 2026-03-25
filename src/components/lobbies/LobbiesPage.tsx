import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { createLobby, joinLobby, getMyLobbies, getLobbyLeaderboard, leaveLobby } from '../../lib/lobbies'
import { useGames } from '../../hooks/useGames'
import CollegeLogo from '../shared/CollegeLogo'
import { formatCoins, getRankDisplay } from '../../lib/utils'
import LobbyChat from './LobbyChat'
import { AddFriendButton } from '../friends/FriendsPage'
import { ReactNode } from 'react'

// ─── Shared helpers ────────────────────────────────────────────
interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md bg-[#0d0d12] rounded-2xl border border-white/10 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-black text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

interface FieldProps {
  label: string
  children: ReactNode
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-4 py-3 rounded-xl bg-[#111118] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-violet-400/60 transition-all text-sm'

// ─── Create lobby modal ────────────────────────────────────────
interface CreateModalProps {
  onClose: () => void
  onCreated: (lobby: any) => void
  userId: string | undefined
}

function CreateModal({ onClose, onCreated, userId }: CreateModalProps) {
  const { games } = useGames()
  const [name, setName]     = useState('')
  const [gameId, setGameId] = useState('')
  const [busy, setBusy]     = useState(false)
  const [err, setErr]       = useState('')

  const activeGames = games.filter((g) => g.status !== 'cancelled')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    const { data, error } = await createLobby({ name: name.trim(), gameId: gameId || null, userId: userId! })
    setBusy(false)
    if (error) { setErr((error as any).message); return }
    onCreated(data)
  }

  return (
    <Modal title="Create Lobby" onClose={onClose}>
      <form onSubmit={handleCreate} className="space-y-4">
        <Field label="Lobby name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Warrane Legends"
            maxLength={40}
            className={inputCls}
            autoFocus
          />
        </Field>
        <Field label="Scope">
          <select value={gameId} onChange={(e) => setGameId(e.target.value)} className={inputCls}>
            <option value="">Season-long (all games)</option>
            {activeGames.map((g) => (
              <option key={g.id} value={g.id}>
                {g.home_college?.abbreviation} vs {g.away_college?.abbreviation} -{g.sport}
              </option>
            ))}
          </select>
        </Field>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-fuchsia-500 text-white disabled:opacity-40 transition-all"
        >
          {busy ? 'Creating...' : 'Create Lobby'}
        </button>
      </form>
    </Modal>
  )
}

// ─── Join lobby modal ──────────────────────────────────────────
interface JoinModalProps {
  onClose: () => void
  onJoined: (lobby: any) => void
  userId: string | undefined
}

function JoinModal({ onClose, onJoined, userId }: JoinModalProps) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr]   = useState('')

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const { data, error } = await joinLobby({ inviteCode: code, userId: userId! })
    setBusy(false)
    if (error) { setErr((error as any).message); return }
    onJoined(data)
  }

  return (
    <Modal title="Join Lobby" onClose={onClose}>
      <form onSubmit={handleJoin} className="space-y-4">
        <Field label="Invite code">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. WAR4X9"
            maxLength={8}
            className={`${inputCls} tracking-widest text-center font-bold text-lg`}
            autoFocus
          />
        </Field>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button
          type="submit"
          disabled={busy || code.length < 4}
          className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-fuchsia-500 text-white disabled:opacity-40 transition-all"
        >
          {busy ? 'Joining...' : 'Join Lobby'}
        </button>
      </form>
    </Modal>
  )
}

// ─── Lobby detail view ─────────────────────────────────────────
interface LobbyDetailProps {
  lobby: any
  userId: string | undefined
  myId: string | undefined
  onBack: () => void
  onLeft: (lobbyId: string) => void
}

function LobbyDetail({ lobby, userId, myId, onBack, onLeft }: LobbyDetailProps) {
  const [rows, setRows]         = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [copied, setCopied]     = useState(false)
  const [leaving, setLeaving]   = useState(false)

  const game = lobby.games

  useEffect(() => {
    getLobbyLeaderboard(lobby.id, lobby.game_id).then(({ data }) => {
      setRows(data)
      setLoading(false)
    })
  }, [lobby.id, lobby.game_id])

  function copyCode() {
    navigator.clipboard.writeText(lobby.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleLeave() {
    setLeaving(true)
    await leaveLobby({ lobbyId: lobby.id, userId: userId! })
    onLeft(lobby.id)
  }

  const sortLabel = lobby.game_id ? 'Net P&L this game' : 'Coins'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <button onClick={onBack} className="text-gray-500 hover:text-white text-sm mb-2 transition-colors">
            ← Back to Lobbies
          </button>
          <h2 className="text-2xl font-black text-white">{lobby.name}</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {game
              ? `${game.home_college?.abbreviation} vs ${game.away_college?.abbreviation} -${game.sport}`
              : 'Season-long'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={copyCode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/8 border border-white/10 hover:bg-white/12 transition-all text-sm font-mono font-bold text-violet-400"
          >
            {lobby.invite_code}
            <span className="text-gray-500 font-sans font-normal text-xs">
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>
          {lobby.created_by !== userId && (
            <button
              onClick={handleLeave}
              disabled={leaving}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors"
            >
              Leave lobby
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))
        ) : rows.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bets placed yet.</p>
        ) : (
          rows.map((row, i) => {
            const rank = i + 1
            const { icon, class: rankClass } = getRankDisplay(rank)
            const isMe = row.user_id === userId
            const plColor = row.net_pl > 0 ? 'text-green-400' : row.net_pl < 0 ? 'text-red-400' : 'text-gray-400'

            return (
              <div
                key={row.user_id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all
                  ${isMe ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-white/5 border-white/[0.06]'}`}
              >
                <div className={`w-8 text-center font-black text-lg ${rankClass}`}>{icon}</div>
                {row.college && (
                  <CollegeLogo college={row.college} size={36} />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate ${isMe ? 'text-yellow-300' : 'text-white'}`}>
                    {row.display_name} {isMe && '(you)'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {row.wins}/{row.settled} bets - {row.win_rate}%
                  </p>
                </div>
                {!isMe && <AddFriendButton targetId={row.user_id} myId={userId} size="sm" />}
                <div className="text-right">
                  {lobby.game_id ? (
                    <p className={`font-black text-sm ${plColor}`}>
                      {row.net_pl > 0 ? '+' : ''}{formatCoins(row.net_pl)} coins
                    </p>
                  ) : (
                    <p className="text-yellow-400 font-black text-sm">
                      🪙 {formatCoins(row.coins)}
                    </p>
                  )}
                  <p className="text-gray-600 text-[10px] mt-0.5">{sortLabel}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Chat */}
      <LobbyChat lobbyId={lobby.id} userId={userId} userProfile={lobby.lobby_members?.find((m: any) => m.user_id === userId)?.users} />
    </div>
  )
}

// ─── Lobby card ────────────────────────────────────────────────
interface LobbyCardProps {
  lobby: any
  onClick: () => void
}

function LobbyCard({ lobby, onClick }: LobbyCardProps) {
  const game = lobby.games
  const memberCount = lobby.lobby_members?.length ?? 0

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-white/8 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/15 transition-all p-4 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-white font-bold truncate">{lobby.name}</p>
          <p className="text-gray-500 text-sm mt-0.5">
            {game
              ? `${game.home_college?.abbreviation} vs ${game.away_college?.abbreviation} -${game.sport}`
              : 'Season-long'}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-violet-400 font-mono font-bold text-sm">{lobby.invite_code}</p>
          <p className="text-gray-600 text-xs mt-0.5">{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </button>
  )
}

// ─── Main page ─────────────────────────────────────────────────
export default function LobbiesPage() {
  const { profile } = useAuth()
  const [lobbies, setLobbies]           = useState<any[]>([])
  const [selected, setSelected]         = useState<any | null>(null)
  const [loading, setLoading]           = useState(true)
  const [showCreate, setShowCreate]     = useState(false)
  const [showJoin, setShowJoin]         = useState(false)

  const load = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)
    const { data } = await getMyLobbies(profile.id)
    setLobbies(data)
    setLoading(false)
  }, [profile?.id])

  useEffect(() => { load() }, [load])

  function handleCreated(_lobby: any) {
    setShowCreate(false)
    load()
  }

  function handleJoined(_lobby: any) {
    setShowJoin(false)
    load()
  }

  function handleLeft(lobbyId: string) {
    setSelected(null)
    setLobbies((prev) => prev.filter((l) => l.id !== lobbyId))
  }

  if (selected) {
    return (
      <div className="max-w-2xl mx-auto">
        <LobbyDetail
          lobby={selected}
          userId={profile?.id}
          myId={profile?.id}
          onBack={() => setSelected(null)}
          onLeft={handleLeft}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Lobbies</h1>
          <p className="text-gray-400 mt-1">Bet against your friends</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJoin(true)}
            className="px-4 py-2 rounded-xl text-sm font-bold border border-white/12 text-gray-300 hover:border-white/25 hover:text-white transition-all"
          >
            Join
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 transition-all"
          >
            + Create
          </button>
        </div>
      </div>

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse mb-3" />
        ))
      ) : lobbies.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <p className="text-gray-500 text-lg mb-1">No lobbies yet</p>
          <p className="text-gray-600 text-sm">Create one and share the code with friends</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lobbies.map((l) => (
            <LobbyCard key={l.id} lobby={l} onClick={() => setSelected(l)} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateModal
          userId={profile?.id}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
      {showJoin && (
        <JoinModal
          userId={profile?.id}
          onClose={() => setShowJoin(false)}
          onJoined={handleJoined}
        />
      )}
    </div>
  )
}
