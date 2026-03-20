import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',            end: true,  icon: HomeIcon,        label: 'Home'      },
  { to: '/games',       end: true,  icon: GamesIcon,       label: 'Games'     },
  { to: '/bets',        end: false, icon: BetsIcon,        label: 'My Bets'   },
  { to: '/leaderboard', end: false, icon: LeaderboardIcon, label: 'Standings' },
  { to: '/minigames',   end: false, icon: MinigamesIcon,   label: 'Minigames' },
]

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function GamesIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a4.5 4.5 0 0 0 0 9 4.5 4.5 0 0 0 0-9z" strokeWidth="0" fill={active ? 'currentColor' : 'none'} />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

function BetsIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="15" x2="10" y2="15" />
      <line x1="14" y1="15" x2="16" y2="15" />
    </svg>
  )
}

function LeaderboardIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2"  y="14" width="5" height="7" rx="1" />
      <rect x="9"  y="9"  width="5" height="12" rx="1" />
      <rect x="16" y="4"  width="5" height="17" rx="1" />
    </svg>
  )
}

function MinigamesIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="14" rx="3" />
      <circle cx="8.5"  cy="13" r="1.5" />
      <circle cx="15.5" cy="13" r="1.5" />
      <path d="M12 3v3" strokeLinecap="round" />
    </svg>
  )
}

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom"
      style={{ background: 'rgba(4,4,6,0.92)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors
              ${isActive ? 'text-violet-400' : 'text-gray-600 hover:text-gray-400'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                <span className="text-[10px] font-semibold leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
