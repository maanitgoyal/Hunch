import { useState, useEffect, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { signIn, resetPassword } from '../../lib/auth'
import { AuthSplash } from './AuthSplash'
import HunchLogo from '../shared/HunchLogo'

export default function LoginScreen() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent]   = useState(false)

  useEffect(() => {
    if (!loading && user && profile) navigate('/')
  }, [user, profile, loading, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await signIn({ email: email.trim().toLowerCase(), password })
    setBusy(false)
    if (error) {
      setError(
        error.message.includes('Invalid login')
          ? 'Incorrect email or password.'
          : error.message
      )
      return
    }
    navigate('/')
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('Enter your email address first.'); return }
    setBusy(true)
    setError('')
    const { error } = await resetPassword(email.trim().toLowerCase())
    setBusy(false)
    if (error) { setError(error.message); return }
    setResetSent(true)
  }

  if (loading) return <AuthSplash />

  return (
    <AuthLayout>
      <div className="w-full max-w-sm mx-auto">
        <AuthLogo />

        <div className="rounded-3xl border border-[#e0dbd3] bg-white backdrop-blur-2xl p-7 shadow-2xl shadow-[#c8c0b4]/20">
          {!forgotMode ? (
            <>
              <h2 className="text-xl font-bold text-[#1a2744] mb-1">Welcome back</h2>
              <p className="text-[#6b7a99] text-sm mb-6">Sign in to your account</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required autoFocus autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#e0dbd3] text-[#1a2744] placeholder-[#9aaac0] focus:outline-none focus:border-[#2563eb] focus:bg-white transition-all text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => { setForgotMode(true); setError(''); setResetSent(false) }}
                      className="text-xs text-[#6b7a99] hover:text-[#1a2744] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required autoComplete="current-password"
                      className="w-full px-4 py-3 rounded-xl pr-14 bg-white border border-[#e0dbd3] text-[#1a2744] placeholder-[#9aaac0] focus:outline-none focus:border-[#2563eb] focus:bg-white transition-all text-sm"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aaac0] hover:text-[#6b7a99] text-xs font-semibold transition-colors">
                      {showPw ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                {error && <ErrorBox message={error} />}

                <button type="submit" disabled={busy} className={submitCls}>
                  {busy
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    : 'Sign In'
                  }
                </button>
              </form>
            </>
          ) : (
            <>
              <button onClick={() => { setForgotMode(false); setError(''); setResetSent(false) }}
                className="flex items-center gap-1 text-[#6b7a99] hover:text-[#1a2744] text-sm mb-5 transition-colors">
                Back to sign in
              </button>

              <h2 className="text-xl font-bold text-[#1a2744] mb-1">Reset password</h2>
              <p className="text-[#6b7a99] text-sm mb-6">We'll send a reset link to your email.</p>

              {resetSent ? (
                <div className="rounded-xl bg-[#f5f2ee] border border-[#e0dbd3] px-4 py-4 text-center">
                  <p className="text-[#1a2744] font-semibold text-sm">Check your inbox</p>
                  <p className="text-[#6b7a99] text-xs mt-1">A reset link has been sent to {email}</p>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wider mb-1.5">Email</label>
                    <input
                      type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      required autoFocus
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#e0dbd3] text-[#1a2744] placeholder-[#9aaac0] focus:outline-none focus:border-[#2563eb] focus:bg-white transition-all text-sm"
                    />
                  </div>
                  {error && <ErrorBox message={error} />}
                  <button type="submit" disabled={busy} className={submitCls}>
                    {busy
                      ? <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </span>
                      : 'Send Reset Link'
                    }
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="text-center text-[#8a9ab0] text-sm mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#1a2744] font-semibold hover:text-[#243060] transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

// ─── Shared layout & primitives ────────────────────────────

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-[#ede8e1]">
      <div className="relative flex flex-col items-center justify-center flex-1 px-6 py-12">
        {children}
      </div>
    </div>
  )
}

export function AuthLogo() {
  return (
    <div className="mb-8 flex flex-col items-center gap-3">
      <div className="relative">
        <HunchLogo size={72} />
        <div className="absolute -inset-2 rounded-2xl bg-[#1a2744]/8 blur-xl -z-10" />
      </div>
      <div className="text-center">
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: '0.06em' }} className="text-5xl text-[#1a2744]">Hunch</h1>
      </div>
    </div>
  )
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
      <p className="text-red-400 text-sm">{message}</p>
    </div>
  )
}

export const submitCls = `
  w-full py-3.5 rounded-xl font-bold text-white text-sm
  bg-[#1a2744] hover:bg-[#243060]
  active:scale-95 disabled:opacity-50
  transition-all shadow-lg shadow-[#1a2744]/15
`
