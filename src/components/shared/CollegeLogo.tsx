interface CollegeLogoProps {
  college?: {
    logo_url?: string | null
    primary_color?: string | null
    abbreviation?: string | null
    name?: string | null
  } | null
  size?: number
  className?: string
}

export default function CollegeLogo({ college, size = 40, className = '' }: CollegeLogoProps) {
  if (!college) {
    return (
      <div
        className={`rounded-full bg-white/10 flex items-center justify-center text-white font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        ?
      </div>
    )
  }

  if (college.logo_url) {
    return (
      <img
        src={college.logo_url}
        alt={college.name ?? ''}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  // Fallback: coloured circle with abbreviation
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-black ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: college.primary_color ?? '#1a1a2e',
        fontSize: size * 0.3,
      }}
    >
      {college.abbreviation ?? college.name?.slice(0, 3).toUpperCase()}
    </div>
  )
}
