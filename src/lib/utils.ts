export function formatCoins(amount: number): string {
  return new Intl.NumberFormat().format(amount)
}

export function calcPotentialPayout(stake: number, odds: number): number {
  return Math.floor(stake * odds)
}

export function formatOdds(odds: number): string {
  return `${Number(odds).toFixed(2)}x`
}

export function formatGameTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isInFuture(dateStr: string): boolean {
  return new Date(dateStr) > new Date()
}

export const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending:  { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
  won:      { bg: 'bg-green-500/20',  text: 'text-green-400',  label: 'Won'     },
  lost:     { bg: 'bg-red-500/20',    text: 'text-red-400',    label: 'Lost'    },
  refunded: { bg: 'bg-gray-500/20',   text: 'text-gray-400',   label: 'Refunded'},
}

export const GAME_STATUS_COLORS: Record<string, string> = {
  upcoming:  'text-blue-400',
  live:      'text-green-400',
  completed: 'text-gray-400',
  cancelled: 'text-red-400',
}

export const SPORT_EMOJI: Record<string, string> = {
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

export function getSportEmoji(sport: string): string {
  return SPORT_EMOJI[sport] ?? SPORT_EMOJI.default
}

export function getRankDisplay(rank: number): { icon: string; class: string } {
  if (rank === 1) return { icon: '🥇', class: 'text-yellow-400' }
  if (rank === 2) return { icon: '🥈', class: 'text-gray-300' }
  if (rank === 3) return { icon: '🥉', class: 'text-orange-400' }
  return { icon: `#${rank}`, class: 'text-gray-400' }
}

export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '26, 26, 46'
}
