import { Profile } from '../../types'

interface AvatarProps {
  profile: Profile | null | undefined
  size?: number
  className?: string
}

function getInitials(name = '') {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Avatar({ profile, size = 64, className = '' }: AvatarProps) {
  const color   = profile?.colleges?.primary_color ?? '#0891b2'
  const emoji   = profile?.avatar_emoji
  const initials = getInitials(profile?.display_name ?? '')

  return (
    <div
      className={`rounded-2xl flex items-center justify-center shrink-0 select-none font-black text-white relative overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: emoji
          ? 'rgba(255,255,255,0.07)'
          : `linear-gradient(145deg, ${color}ee, ${color}55)`,
        border: emoji
          ? '1px solid rgba(255,255,255,0.12)'
          : `1px solid ${color}44`,
        boxShadow: `0 8px 32px ${color}33`,
        fontSize: emoji ? size * 0.52 : size * 0.38,
      }}
    >
      {!emoji && (
        <div
          className="card-shimmer pointer-events-none absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
        />
      )}
      {emoji ?? initials}
    </div>
  )
}
