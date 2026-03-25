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
        className={`rounded-full bg-[#ece7e0] flex items-center justify-center text-[#6b7a99] font-bold ${className}`}
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
        backgroundColor: college.primary_color ?? '#1a2744',
        fontSize: size * 0.3,
      }}
    >
      {college.abbreviation ?? college.name?.slice(0, 3).toUpperCase()}
    </div>
  )
}
