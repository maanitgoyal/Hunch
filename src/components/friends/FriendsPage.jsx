import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  searchUsers, sendFriendRequest, respondToRequest,
  removeFriend, getFriends, getPendingRequests, getFriendshipStatus,
} from '../../lib/friends'
import CollegeLogo from '../shared/CollegeLogo'
import { formatCoins } from '../../lib/utils'

function Avatar({ user, size = 40 }) {
  const color = user?.colleges?.primary_color ?? '#0891b2'
  const initials = (user?.display_name ?? '?').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="rounded-xl flex items-center justify-center font-black text-white shrink-0 select-none"
      style={{
        width: size, height: size, fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${color}cc, ${color}55)`,
        border: `1px solid ${color}44`,
      }}
    >
      {initials}
    </div>
  )
}

function UserRow({ user, action }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-white/[0.04] border border-white/[0.06]">
      <Avatar user={user} size={42} />
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{user.display_name}</p>
        <p className="text-gray-500 text-xs truncate">{user.colleges?.name ?? 'No college'}</p>
      </div>
      {action}
    </div>
  )
}

// ─── Add friend button with status awareness ───────────────────
export function AddFriendButton({ targetId, myId, size = 'sm' }) {
  const [status, setStatus] = useState(null) // null | 'pending' | 'accepted' | 'sent'
  const [busy, setBusy]     = useState(false)

  useEffect(() => {
    if (!myId || !targetId || myId === targetId) return
    getFriendshipStatus(myId, targetId).then((f) => {
      if (!f) return
      if (f.status === 'accepted') setStatus('accepted')
      else if (f.sender_id === myId) setStatus('sent')
      else setStatus('pending')
    })
  }, [myId, targetId])

  if (myId === targetId) return null

  async function handle() {
    if (busy || status === 'accepted' || status === 'sent') return
    setBusy(true)
    await sendFriendRequest(myId, targetId)
    setStatus('sent')
    setBusy(false)
  }

  const cls = size === 'sm'
    ? 'px-3 py-1 rounded-lg text-xs font-bold transition-all'
    : 'px-4 py-2 rounded-xl text-sm font-bold transition-all'

  if (status === 'accepted') return <span className={`${cls} text-green-400 bg-green-500/10`}>Friends</span>
  if (status === 'sent')     return <span className={`${cls} text-gray-500 bg-white/5`}>Requested</span>
  if (status === 'pending')  return <span className={`${cls} text-violet-400 bg-violet-500/10`}>Respond</span>

  return (
    <button onClick={handle} disabled={busy} className={`${cls} bg-violet-600/20 text-violet-400 hover:bg-violet-600/35 border border-violet-500/25`}>
      {busy ? '...' : '+ Add'}
    </button>
  )
}

// ─── Search section ────────────────────────────────────────────
function SearchSection({ myId, onClose }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const { data } = await searchUsers(query.trim())
      setResults(data.filter((u) => u.id !== myId))
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, myId])

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name..."
        autoFocus
        className="w-full px-4 py-3 rounded-xl bg-[#111118] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-violet-400/60 transition-all text-sm"
      />
      {loading && <p className="text-gray-500 text-sm text-center">Searching...</p>}
      <div className="space-y-2">
        {results.map((u) => (
          <UserRow
            key={u.id}
            user={u}
            action={<AddFriendButton targetId={u.id} myId={myId} />}
          />
        ))}
        {!loading && query.length >= 2 && results.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-4">No users found</p>
        )}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────
const TABS = ['Friends', 'Requests', 'Find']

export default function FriendsPage() {
  const { profile } = useAuth()
  const [tab, setTab]           = useState('Friends')
  const [friends, setFriends]   = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)

  const load = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)
    const [{ data: f }, { data: r }] = await Promise.all([
      getFriends(profile.id),
      getPendingRequests(profile.id),
    ])
    setFriends(f)
    setRequests(r)
    setLoading(false)
  }, [profile?.id])

  useEffect(() => { load() }, [load])

  async function handleRespond(friendshipId, status) {
    await respondToRequest(friendshipId, status)
    load()
  }

  async function handleRemove(friendshipId) {
    await removeFriend(friendshipId)
    setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Friends</h1>
        <p className="text-gray-400 mt-1">Connect with other players</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 bg-white/5 p-1 rounded-xl">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all relative
              ${tab === t
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                : 'text-gray-400 hover:text-white'}`}
          >
            {t}
            {t === 'Requests' && requests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-black text-white flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'Find' ? (
        <SearchSection myId={profile?.id} />
      ) : tab === 'Requests' ? (
        loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-500">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.map((r) => (
              <UserRow
                key={r.id}
                user={r.sender}
                action={
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(r.id, 'accepted')}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-green-500/20 text-green-400 hover:bg-green-500/35 border border-green-500/25 transition-all"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(r.id, 'declined')}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-white/8 text-gray-400 hover:bg-white/15 transition-all"
                    >
                      Decline
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )
      ) : (
        loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
        ) : friends.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-500 text-lg mb-1">No friends yet</p>
            <p className="text-gray-600 text-sm">Go to Find to search for people</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <UserRow
                key={f.id}
                user={f}
                action={
                  <button
                    onClick={() => handleRemove(f.friendshipId)}
                    className="px-3 py-1 rounded-lg text-xs text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    Remove
                  </button>
                }
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}
