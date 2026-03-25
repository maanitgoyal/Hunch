import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateProfile, updatePassword } from '../../lib/auth'
import { useBets } from '../../hooks/useBets'
import { formatCoins } from '../../lib/utils'
import CollegeLogo from '../shared/CollegeLogo'
import Avatar from '../shared/Avatar'
import { useTutorial } from '../../context/TutorialContext'
import { ReactNode } from 'react'

const EMOJI_OPTIONS = [
  { emoji: '🦁', label: 'Lion'       },
  { emoji: '🐯', label: 'Tiger'      },
  { emoji: '🦊', label: 'Fox'        },
  { emoji: '🐺', label: 'Wolf'       },
  { emoji: '🦅', label: 'Eagle'      },
  { emoji: '🐻', label: 'Bear'       },
  { emoji: '🦈', label: 'Shark'      },
  { emoji: '🐉', label: 'Dragon'     },
  { emoji: '🔥', label: 'Fire'       },
  { emoji: '⚡', label: 'Lightning'  },
  { emoji: '💫', label: 'Comet'      },
  { emoji: '🌊', label: 'Wave'       },
  { emoji: '👑', label: 'Crown'      },
  { emoji: '🎯', label: 'Bullseye'   },
  { emoji: '🏆', label: 'Trophy'     },
  { emoji: '🌟', label: 'Star'       },
  { emoji: '⚽', label: 'Soccer'     },
  { emoji: '🏀', label: 'Basketball' },
  { emoji: '🏈', label: 'Football'   },
  { emoji: '🎾', label: 'Tennis'     },
  { emoji: '🥊', label: 'Boxing'     },
  { emoji: '🎱', label: 'Billiards'  },
  { emoji: '🤖', label: 'Robot'      },
  { emoji: '🎭', label: 'Wildcard'   },
]

interface SectionProps {
  title: string
  children: ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="rounded-2xl border border-[#e0dbd3] bg-white backdrop-blur-xl p-6 space-y-4">
      <h2 className="text-lg font-bold text-[#1a2744]">{title}</h2>
      {children}
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
      <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-4 py-3 rounded-xl bg-[#f0ece6] border border-[#e0dbd3] text-[#1a2744] placeholder-[#9aaac0] focus:outline-none focus:border-[#2563eb]/40 focus:bg-[#ece7e0] transition-all text-sm'

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const { bets } = useBets(profile?.id)
  const { openTutorial } = useTutorial()

  const [name, setName]         = useState(profile?.display_name ?? '')
  const [nameMsg, setNameMsg]   = useState('')
  const [nameBusy, setNameBusy] = useState(false)

  const [emojiSaving, setEmojiSaving] = useState(false)

  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg]         = useState('')
  const [pwBusy, setPwBusy]       = useState(false)
  const [showPw, setShowPw]       = useState(false)

  if (!profile) return null

  const wonBets  = bets.filter((b) => b.status === 'won')
  const lostBets = bets.filter((b) => b.status === 'lost')
  const won      = wonBets.length
  const lost     = lostBets.length
  const pending  = bets.filter((b) => b.status === 'pending').length
  const total    = bets.length
  const winRate  = total > 0 ? Math.round((won / (won + lost || 1)) * 100) : 0

  const totalWagered = bets.reduce((s: number, b) => s + b.stake, 0)
  const netPL        = wonBets.reduce((s: number, b) => s + (b.payout - b.stake), 0) - lostBets.reduce((s: number, b) => s + b.stake, 0)
  const bestWin      = wonBets.reduce((best: number, b) => Math.max(best, b.payout - b.stake), 0)
  const worstLoss    = lostBets.reduce((worst: number, b) => Math.max(worst, b.stake), 0)

  const settledDesc = [...wonBets, ...lostBets].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  let streak = 0
  for (const b of settledDesc) {
    if (b.status === 'won') streak++
    else break
  }

  async function pickEmoji(emoji: string) {
    const next = emoji === profile.avatar_emoji ? null : emoji
    setEmojiSaving(true)
    await updateProfile(profile.id, { avatar_emoji: next })
    await refreshProfile()
    setEmojiSaving(false)
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setNameBusy(true)
    setNameMsg('')
    const { error } = await updateProfile(profile.id, { display_name: name.trim() })
    setNameBusy(false)
    if (error) { setNameMsg((error as any).message); return }
    await refreshProfile()
    setNameMsg('Name updated!')
    setTimeout(() => setNameMsg(''), 3000)
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) { setPwMsg('Passwords do not match'); return }
    if (newPw.length < 8)    { setPwMsg('Password must be at least 8 characters'); return }
    setPwBusy(true)
    setPwMsg('')
    const { error } = await updatePassword(newPw)
    setPwBusy(false)
    if (error) { setPwMsg((error as any).message); return }
    setNewPw(''); setConfirmPw('')
    setPwMsg('Password updated!')
    setTimeout(() => setPwMsg(''), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[#1a2744]">Profile</h1>
        <p className="text-[#6b7a99] mt-1">Manage your account</p>
      </div>

      {/* Identity card */}
      <div className="rounded-2xl border border-[#e0dbd3] bg-white backdrop-blur-xl p-6">
        <div className="flex items-center gap-5">
          <Avatar profile={profile} size={80} />
          <div className="flex-1 min-w-0">
            <p className="text-[#1a2744] font-bold text-2xl truncate">{profile.display_name}</p>
            <div className="flex items-center gap-2 mt-1">
              <CollegeLogo college={profile.colleges} size={20} />
              <p className="text-[#6b7a99] text-sm">{profile.colleges?.name ?? 'No college'}</p>
            </div>
            <p className="text-amber-600 font-bold mt-2">🪙 {formatCoins(profile.coins)}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#e0dbd3]">
          {[
            { label: 'Total Bets', value: total },
            { label: 'Won', value: won, color: 'text-green-400' },
            { label: 'Lost', value: lost, color: 'text-red-400' },
            { label: 'Win Rate', value: `${winRate}%`, color: 'text-[#1a2744]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className={`text-xl font-black ${color ?? 'text-[#1a2744]'}`}>{value}</p>
              <p className="text-[#8a9ab0] text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Season stats */}
      {total > 0 && (
        <div className="rounded-2xl border border-[#e0dbd3] bg-white backdrop-blur-xl p-6">
          <h2 className="text-lg font-bold text-[#1a2744] mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total wagered',   value: `🪙 ${formatCoins(totalWagered)}`,                    color: 'text-[#1a2744]'      },
              { label: 'Net P&L',         value: `${netPL >= 0 ? '+' : ''}${formatCoins(netPL)}`,       color: netPL >= 0 ? 'text-green-400' : 'text-red-400' },
              { label: 'Best single win', value: bestWin > 0 ? `+${formatCoins(bestWin)}` : '-',        color: 'text-amber-600' },
              { label: 'Worst loss',      value: worstLoss > 0 ? `-${formatCoins(worstLoss)}` : '-',    color: worstLoss > 0 ? 'text-red-400' : 'text-[#8a9ab0]' },
              { label: 'Pending bets',    value: pending,                                                color: 'text-[#4a5a7a]'   },
              { label: 'Win streak',      value: streak >= 1 ? `🔥 ${streak}` : streak === 0 && won === 0 ? '-' : '0', color: streak >= 3 ? 'text-orange-400' : 'text-[#1a2744]' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#f5f2ee] border border-[#e0dbd3] rounded-xl px-4 py-3">
                <p className={`font-black text-base ${color}`}>{value}</p>
                <p className="text-[#8a9ab0] text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Avatar picker */}
      <div className="rounded-2xl border border-[#e0dbd3] bg-white backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1a2744]">Avatar</h2>
          {profile.avatar_emoji && (
            <button
              onClick={() => pickEmoji(profile.avatar_emoji!)}
              disabled={emojiSaving}
              className="text-xs text-[#8a9ab0] hover:text-[#4a5a7a] transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-[#8a9ab0] text-xs -mt-2">Tap to select. Tap again to remove.</p>
        <div className="grid grid-cols-8 gap-2">
          {EMOJI_OPTIONS.map(({ emoji, label }) => (
            <button
              key={emoji}
              onClick={() => pickEmoji(emoji)}
              disabled={emojiSaving}
              title={label}
              className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95
                ${profile.avatar_emoji === emoji
                  ? 'bg-[#e8e2da] border border-[#d8d2ca] shadow-lg shadow-[#1a2744]/10 scale-110'
                  : 'bg-[#f5f2ee] border border-[#e0dbd3] hover:bg-[#ece7e0]'}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Change name */}
      <Section title="Display Name">
        <form onSubmit={saveName} className="space-y-3">
          <Field label="Display Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              className={inputCls}
              placeholder="Your name or nickname"
            />
          </Field>
          {nameMsg && (
            <p className={`text-sm ${nameMsg.includes('updated') ? 'text-green-400' : 'text-red-400'}`}>
              {nameMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={nameBusy || !name.trim() || name.trim() === profile.display_name}
            className="px-6 py-2.5 rounded-xl bg-[#1a2744] hover:bg-[#243060] text-white text-sm font-bold transition-all disabled:opacity-40 shadow-lg shadow-[#1a2744]/10"
          >
            {nameBusy ? 'Saving...' : 'Save Name'}
          </button>
        </form>
      </Section>

      {/* How to play */}
      <button
        onClick={openTutorial}
        className="w-full rounded-2xl border border-[#e0dbd3] bg-white backdrop-blur-xl px-6 py-4 flex items-center justify-between group hover:bg-[#f5f2ee] transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <p className="text-[#1a2744] font-bold text-sm">How to play</p>
            <p className="text-[#8a9ab0] text-xs mt-0.5">A quick tour of everything Hunch has to offer</p>
          </div>
        </div>
        <span className="text-[#9aaac0] group-hover:text-[#6b7a99] transition-colors text-lg">›</span>
      </button>

      {/* Change password */}
      <Section title="Change Password">
        <form onSubmit={savePassword} className="space-y-3">
          <Field label="New Password">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 8 characters"
                className={`${inputCls} pr-14`}
              />
              <button type="button" onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9ab0] hover:text-[#4a5a7a] text-xs font-semibold">
                {showPw ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </Field>
          <Field label="Confirm New Password">
            <input
              type={showPw ? 'text' : 'password'}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Repeat password"
              className={`${inputCls} ${confirmPw && confirmPw !== newPw ? '!border-red-500/50' : ''}`}
            />
            {confirmPw && confirmPw !== newPw && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
            )}
          </Field>
          {pwMsg && (
            <p className={`text-sm ${pwMsg.includes('updated') ? 'text-green-400' : 'text-red-400'}`}>
              {pwMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={pwBusy || !newPw || !confirmPw}
            className="px-6 py-2.5 rounded-xl bg-[#1a2744] hover:bg-[#243060] text-white text-sm font-bold transition-all disabled:opacity-40 shadow-lg shadow-[#1a2744]/10"
          >
            {pwBusy ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </Section>
    </div>
  )
}
