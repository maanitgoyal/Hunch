import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { signUp, verifySignupOTP, resendConfirmation, createProfile } from '../../lib/auth'
import OTPInput from './OTPInput'
import { AuthLayout, AuthLogo, ErrorBox, submitCls } from './LoginScreen'
import { supabase } from '../../lib/supabase'

const STEP = { DETAILS: 'details', OTP: 'otp' }
const RESEND_SECS = 60

export default function SignupScreen() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]         = useState(STEP.DETAILS)
  const [colleges, setColleges] = useState([])

  // Form fields
  const [displayName, setName]  = useState('')
  const [collegeId, setCollege] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirm] = useState('')
  const [showPw, setShowPw]     = useState(false)

  const [userId, setUserId]     = useState(null) // set after signUp succeeds

  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)
  const [countdown, setCount]   = useState(0)

  useEffect(() => {
    if (!loading && user && profile) navigate('/')
  }, [user, profile, loading, navigate])

  useEffect(() => {
    supabase.from('colleges').select('*').order('name').then(({ data }) => {
      if (data) setColleges(data)
    })
  }, [])

  // Resend countdown
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCount((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Password validation helpers
  const pwLong  = password.length >= 8
  const pwMatch = confirmPw === '' || password === confirmPw
  const pwStrengthLevel = Math.min(
    Math.floor(password.length / 3),
    4
  )
  const pwColor = pwStrengthLevel >= 4 ? 'bg-green-400'
    : pwStrengthLevel >= 3 ? 'bg-yellow-400'
    : 'bg-red-400'

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    if (!displayName.trim()) { setError('Enter a display name'); return }
    if (!collegeId)           { setError('Select your college'); return }
    if (!pwLong)              { setError('Password must be at least 8 characters'); return }
    if (password !== confirmPw) { setError('Passwords do not match'); return }

    setBusy(true)
    const { data, error } = await signUp({ email: email.trim().toLowerCase(), password })
    setBusy(false)

    if (error) {
      setError(error.message)
      return
    }

    // Supabase may auto-confirm if email confirmations are OFF in dashboard
    // If user is already confirmed, go straight to profile creation
    if (data.user?.confirmed_at || data.session) {
      await finishProfile(data.user.id)
      return
    }

    // Otherwise, show OTP step
    setUserId(data.user?.id ?? null)
    setStep(STEP.OTP)
    setCount(RESEND_SECS)
  }

  async function handleVerifyOTP(code) {
    setBusy(true)
    setError('')
    const { data, error } = await verifySignupOTP(email.trim().toLowerCase(), code)
    if (error) {
      setBusy(false)
      setError('Incorrect or expired code — try again.')
      return
    }
    await finishProfile(data.user?.id ?? userId)
  }

  async function finishProfile(uid) {
    const { error } = await createProfile({
      userId:      uid,
      displayName: displayName.trim(),
      collegeId,
    })
    if (error) { setBusy(false); setError(error.message); return }
    await refreshProfile()
    setBusy(false)
    navigate('/')
  }

  async function handleResend() {
    if (countdown > 0) return
    const { error } = await resendConfirmation(email.trim().toLowerCase())
    if (error) { setError(error.message); return }
    setCount(RESEND_SECS)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#080810]">
      <div className="w-5 h-5 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
    </div>
  )

  return (
    <AuthLayout>
      <div className="w-full max-w-sm mx-auto">
        <AuthLogo />

        <div className="rounded-3xl border border-white/8 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden">

          {/* ── Step indicator ─────────────────────────── */}
          <div className="flex border-b border-white/8">
            {['Your details', 'Verify email'].map((label, i) => (
              <div
                key={i}
                className={`flex-1 py-3 text-center text-xs font-semibold tracking-wide transition-colors
                  ${i === (step === STEP.DETAILS ? 0 : 1)
                    ? 'text-violet-400 border-b-2 border-violet-400'
                    : 'text-gray-600'}`}
              >
                <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] mr-1.5
                  ${i < (step === STEP.OTP ? 1 : 0) ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-500'}`}>
                  {i < (step === STEP.OTP ? 1 : 0) ? '✓' : i + 1}
                </span>
                {label}
              </div>
            ))}
          </div>

          <div className="p-7">
            {/* ── Step 1: Details ──────────────────────── */}
            {step === STEP.DETAILS && (
              <>
                <h2 className="text-xl font-bold text-white mb-1">Create account</h2>
                <p className="text-gray-400 text-sm mb-6">
                  1,000 coins free to start <span className="text-violet-400">🪙</span>
                </p>

                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Display name */}
                  <Field label="Display name">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name or nickname"
                      required maxLength={30} autoFocus
                      className={inputCls}
                    />
                  </Field>

                  {/* College */}
                  <Field label="College">
                    <CollegeSelect
                      colleges={colleges}
                      value={collegeId}
                      onChange={setCollege}
                    />
                  </Field>

                  {/* Email */}
                  <Field label="Email">
                    <input
                      type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      required autoComplete="email"
                      className={inputCls}
                    />
                  </Field>

                  {/* Password */}
                  <Field label="Password">
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        required autoComplete="new-password"
                        className={`${inputCls} pr-14 ${password && !pwLong ? '!border-red-500/50' : ''}`}
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs font-semibold transition-colors">
                        {showPw ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                    {password && (
                      <div className="flex gap-1 mt-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i < pwStrengthLevel ? pwColor : 'bg-white/10'}`} />
                        ))}
                      </div>
                    )}
                  </Field>

                  {/* Confirm password */}
                  <Field label="Confirm password">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirmPw}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat password"
                      required autoComplete="new-password"
                      className={`${inputCls} ${confirmPw && !pwMatch ? '!border-red-500/50' : ''}`}
                    />
                    {confirmPw && !pwMatch && (
                      <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
                    )}
                  </Field>

                  {error && <ErrorBox message={error} />}

                  <button type="submit" disabled={busy} className={submitCls}>
                    {busy
                      ? <BtnSpinner />
                      : 'Create Account & Send Code →'}
                  </button>
                </form>
              </>
            )}

            {/* ── Step 2: OTP ──────────────────────────── */}
            {step === STEP.OTP && (
              <>
                <button onClick={() => { setStep(STEP.DETAILS); setError('') }}
                  className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-5 transition-colors">
                  ← Back
                </button>

                <h2 className="text-xl font-bold text-white mb-1">Check your email</h2>
                <p className="text-gray-400 text-sm mb-1">We sent a 6-digit code to</p>
                <p className="text-violet-400 font-semibold text-sm mb-6 truncate">{email}</p>

                <OTPInput length={6} onComplete={handleVerifyOTP} disabled={busy} />

                {busy && (
                  <div className="flex justify-center mt-5">
                    <div className="w-5 h-5 border-2 border-yellow-400/40 border-t-yellow-400 rounded-full animate-spin" />
                  </div>
                )}

                {error && <div className="mt-4"><ErrorBox message={error} /></div>}

                <div className="mt-5 text-center">
                  {countdown > 0
                    ? <p className="text-gray-500 text-sm">Resend in {countdown}s</p>
                    : <button onClick={handleResend} className="text-violet-400 text-sm font-semibold hover:text-yellow-300 transition-colors">
                        Resend code
                      </button>
                  }
                </div>

                <p className="text-gray-600 text-xs mt-4 text-center">
                  Check your spam folder if you don't see it.
                </p>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
            Sign in →
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

// ─── Small helpers ─────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function BtnSpinner() {
  return (
    <span className="flex items-center justify-center gap-2">
      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
      Creating account…
    </span>
  )
}

const inputCls = 'w-full px-4 py-3 rounded-xl bg-white/8 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-violet-400/60 focus:bg-white/10 transition-all text-sm'

function CollegeSelect({ colleges, value, onChange }) {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const [cursor, setCursor]   = useState(-1)
  const containerRef          = useRef(null)
  const inputRef              = useRef(null)
  const listRef               = useRef(null)

  const selected = colleges.find((c) => c.id === value)
  const filtered = query.trim()
    ? colleges.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : colleges

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (cursor >= 0 && listRef.current) {
      const item = listRef.current.children[cursor]
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [cursor])

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) { setOpen(true); return }
      setCursor((c) => Math.min(c + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (cursor >= 0 && filtered[cursor]) {
        select(filtered[cursor])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function select(college) {
    onChange(college.id)
    setQuery('')
    setCursor(-1)
    setOpen(false)
  }

  function handleInputChange(e) {
    setQuery(e.target.value)
    setCursor(-1)
    if (!open) setOpen(true)
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-center w-full px-4 py-3 rounded-xl bg-[#13131f] border transition-all text-sm cursor-text
          ${open ? 'border-yellow-400/60' : 'border-white/10'}`}
        onClick={() => { setOpen(true); inputRef.current?.focus() }}
      >
        {!open && selected ? (
          <span className="flex-1 text-white">{selected.name}</span>
        ) : (
          <input
            ref={inputRef}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            placeholder={selected ? selected.name : 'Select your college…'}
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"
          />
        )}
        <span className="text-gray-500 text-sm ml-2 select-none">{open ? '▴' : '▾'}</span>
      </div>

      {open && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full rounded-xl bg-[#13131f] border border-white/10 shadow-xl max-h-48 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-gray-500 text-sm">No colleges found</li>
          ) : (
            filtered.map((c, i) => (
              <li
                key={c.id}
                onMouseDown={() => select(c)}
                onMouseEnter={() => setCursor(i)}
                className={`px-4 py-3 text-sm cursor-pointer transition-colors
                  ${i === cursor ? 'bg-yellow-400/10 text-violet-400' : 'text-white hover:bg-white/5'}
                  ${c.id === value ? 'font-semibold' : ''}`}
              >
                {c.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
