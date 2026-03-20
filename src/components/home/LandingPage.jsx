import { NavLink } from 'react-router-dom'
import HunchLogo from '../shared/HunchLogo'

const features = [
  { icon: '🏆', title: 'Pick winners',        desc: 'Predict who takes the game before kick-off.' },
  { icon: '📈', title: 'Dynamic odds',        desc: 'Odds shift live as more bets come in — lock yours in early.' },
  { icon: '⚽', title: 'Live betting',        desc: 'Markets can stay open during the match.' },
  { icon: '🪙', title: 'Compete for coins',  desc: 'Climb the leaderboard. Top your college.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
        style={{ background: 'rgba(2,2,2,0.82)', backdropFilter: 'blur(24px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: '60px' }}>
          <div className="flex items-center gap-2">
            <HunchLogo size={36} />
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: '0.06em', fontSize: '1.35rem' }} className="bg-gradient-to-r from-cyan-300 via-sky-300 to-cyan-400 bg-clip-text text-transparent">Hunch</span>
          </div>
          <div className="flex items-center gap-3">
            <NavLink
              to="/login"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/8 transition-all"
            >
              Log in
            </NavLink>
            <NavLink
              to="/signup"
              className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white shadow-lg shadow-cyan-500/25 transition-all"
            >
              Sign up free
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold mb-8 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          College sports prediction
        </div>

        <h1 className="text-5xl sm:text-7xl font-black text-white leading-none tracking-tight mb-6">
          Predict.{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
            Win.
          </span>{' '}
          Repeat.
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed">
          Place bets on college sport matches using virtual coins.
          Odds shift dynamically as the crowd picks sides.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <NavLink
            to="/signup"
            className="px-8 py-3.5 rounded-xl text-base font-black bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get started free
          </NavLink>
          <NavLink
            to="/login"
            className="px-8 py-3.5 rounded-xl text-base font-semibold text-gray-300 border border-white/12 hover:border-white/25 hover:text-white hover:bg-white/5 transition-all"
          >
            I have an account
          </NavLink>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-24 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-5 text-center"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <p className="text-white font-bold text-sm mb-1">{f.title}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
