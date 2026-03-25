import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { signOut } from '../../lib/auth'
import CoinDisplay from './CoinDisplay'
import HunchLogo from './HunchLogo'


const LOGO_FONT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: '0.06em', fontSize: '1.35rem' }

const navLinks = [
  { to: '/',            label: 'Home',        end: true  },
  { to: '/games',       label: 'Games',       end: true  },
  { to: '/leaderboard', label: 'Leaderboard', end: false },
  { to: '/bets',        label: 'My Bets',     end: false },
  { to: '/lobbies',     label: 'Lobbies',     end: false },
  { to: '/friends',     label: 'Friends',     end: false },
  { to: '/minigames',   label: 'Minigames',   end: false },
]

export default function TopNav() {
  const { profile } = useAuth()
  const navigate = useNavigate()


  const links = profile?.is_admin
    ? [...navLinks, { to: '/admin', label: 'Admin', end: false }]
    : navLinks

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#d8d2ca]"
      style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)' }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-4" style={{ height: '60px' }}>

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0 group">
          <HunchLogo size={36} className="drop-shadow-lg transition-all" />
          <span style={LOGO_FONT} className="text-[#1a2744]">Hunch</span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center overflow-x-auto no-scrollbar">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                ${isActive
                  ? 'bg-[#1a2744]/8 text-[#1a2744] font-bold'
                  : 'text-[#6b7a99] hover:text-[#1a2744] hover:bg-[#f0ece6]'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-3 shrink-0 ml-auto">
          {profile && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f5f2ee] border border-[#e0dbd3]">
                <CoinDisplay amount={profile.coins} size="sm" />
              </div>
              <div className="h-4 w-px bg-white/10" />
              <NavLink
                to="/profile"
                className="text-sm font-medium text-[#6b7a99] hover:text-[#1a2744] transition-colors"
              >
                {profile.display_name}
              </NavLink>
              <button
                onClick={handleSignOut}
                className="text-xs text-[#9aaac0] hover:text-[#6b7a99] transition-colors px-2 py-1 rounded hover:bg-[#f0ece6]"
              >
                Sign out
              </button>
            </>
          )}
        </div>

        {/* Mobile: coins + profile */}
        {profile && (
          <div className="md:hidden flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#f5f2ee] border border-[#e0dbd3]">
              <CoinDisplay amount={profile.coins} size="sm" />
            </div>
            <NavLink
              to="/profile"
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#f5f2ee] border border-[#e0dbd3] text-[#1a2744] font-bold text-sm"
            >
              {(profile.display_name ?? 'U').trim()[0].toUpperCase()}
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  )
}
