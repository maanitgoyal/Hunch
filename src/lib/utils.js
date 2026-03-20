// ─── Coin formatting ────────────────────────────────────────
export function formatCoins(amount) {
  return new Intl.NumberFormat().format(amount)
}

// ─── Odds & payout ──────────────────────────────────────────
export function calcPotentialPayout(stake, odds) {
  return Math.floor(stake * odds)
}

export function formatOdds(odds) {
  return `${Number(odds).toFixed(2)}x`
}

// ─── Date/time ──────────────────────────────────────────────
export function formatGameTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isInFuture(dateStr) {
  return new Date(dateStr) > new Date()
}

// ─── Status helpers ─────────────────────────────────────────
export const STATUS_COLORS = {
  pending:  { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
  won:      { bg: 'bg-green-500/20',  text: 'text-green-400',  label: 'Won'     },
  lost:     { bg: 'bg-red-500/20',    text: 'text-red-400',    label: 'Lost'    },
  refunded: { bg: 'bg-gray-500/20',   text: 'text-gray-400',   label: 'Refunded'},
}

export const GAME_STATUS_COLORS = {
  upcoming:  'text-blue-400',
  live:      'text-green-400',
  completed: 'text-gray-400',
  cancelled: 'text-red-400',
}

// ─── Sport emoji ─────────────────────────────────────────────
export const SPORT_EMOJI = {
  Basketball: '🏀',
  Volleyball: '🏐',
  Football:   '⚽',
  Soccer:     '⚽',
  Cricket:    '🏏',
  Rugby:      '🏉',
  Tennis:     '🎾',
  Netball:    '🏐',
  default:    '🏆',
}

export function getSportEmoji(sport) {
  return SPORT_EMOJI[sport] ?? SPORT_EMOJI.default
}

// ─── Rank medals ─────────────────────────────────────────────
export function getRankDisplay(rank) {
  if (rank === 1) return { icon: '🥇', class: 'text-yellow-400' }
  if (rank === 2) return { icon: '🥈', class: 'text-gray-300' }
  if (rank === 3) return { icon: '🥉', class: 'text-orange-400' }
  return { icon: `#${rank}`, class: 'text-gray-400' }
}

// ─── Color helpers ────────────────────────────────────────────
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '26, 26, 46'
}
