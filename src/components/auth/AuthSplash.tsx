import HunchLogo from '../shared/HunchLogo'

export function AuthSplash() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <HunchLogo size={64} />
          <div className="absolute -inset-2 rounded-2xl bg-violet-500/15 blur-xl -z-10" />
        </div>
        <div className="w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      </div>
    </div>
  )
}
