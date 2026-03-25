import { NavLink } from 'react-router-dom'
import HunchLogo from '../shared/HunchLogo'

const features = [
  { title: 'Pick winners',       desc: 'Predict who takes the game before kick-off.' },
  { title: 'Dynamic odds',       desc: 'Odds shift as more bets come in. Lock yours in early.' },
  { title: 'Compete for coins',  desc: 'Climb the leaderboard. Top your college.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#ede8e1]">
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-[#d8d2ca]"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: '60px' }}>
          <div className="flex items-center gap-2">
            <HunchLogo size={36} />
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: '0.06em', fontSize: '1.35rem' }} className="text-[#1a2744]">Hunch</span>
          </div>
          <div className="flex items-center gap-3">
            <NavLink
              to="/login"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-[#6b7a99] hover:text-[#1a2744] hover:bg-[#f0ece6] transition-all"
            >
              Log in
            </NavLink>
            <NavLink
              to="/signup"
              className="px-4 py-2 rounded-lg text-sm font-bold bg-[#1a2744] text-white hover:bg-[#243060] transition-all"
            >
              Sign up free
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        <h1 className="text-5xl sm:text-7xl font-black text-[#1a2744] leading-none tracking-tight mb-6">
          Predict.{' '}
          <span className="text-shimmer">Win.</span>{' '}
          Repeat.
        </h1>

        <p className="text-[#6b7a99] text-lg sm:text-xl max-w-xl mb-10 leading-relaxed">
          Place bets on college sport matches using virtual coins.
          Odds shift dynamically as the crowd picks sides.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <NavLink
            to="/signup"
            className="px-8 py-3.5 rounded-xl text-base font-black bg-[#1a2744] text-white hover:bg-[#243060] shadow-xl shadow-[#1a2744]/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get started free
          </NavLink>
          <NavLink
            to="/login"
            className="px-8 py-3.5 rounded-xl text-base font-semibold text-[#6b7a99] border border-[#d8d2ca] hover:border-[#c0b8ae] hover:text-[#1a2744] hover:bg-white transition-all"
          >
            I have an account
          </NavLink>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 pb-24 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[#e0dbd3] bg-white p-5 text-center hover:border-[#d0c9bf] hover:shadow-md transition-all"
            >
              <p className="text-[#1a2744] font-bold text-sm mb-1">{f.title}</p>
              <p className="text-[#8a9ab0] text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
