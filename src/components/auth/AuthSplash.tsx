import HunchLogo from '../shared/HunchLogo'

export function AuthSplash() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <HunchLogo size={64} />
          <div className="absolute -inset-2 rounded-2xl bg-[#1a2744]/8 blur-xl -z-10" />
        </div>
        <div className="w-5 h-5 border-2 border-[#1a2744]/20 border-t-[#1a2744] rounded-full animate-spin" />
      </div>
    </div>
  )
}
