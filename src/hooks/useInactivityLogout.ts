import { useEffect, useRef } from 'react'
import { signOut } from '../lib/auth'

const INACTIVITY_MS = 2 * 60 * 60 * 1000

const ACTIVITY_EVENTS = [
  'mousemove', 'mousedown', 'keydown',
  'scroll', 'touchstart', 'click', 'wheel',
]

export function useInactivityLogout(enabled: boolean, onLogout: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled) return

    function reset() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(async () => {
        await signOut()
        onLogout?.()
      }, INACTIVITY_MS)
    }

    reset()
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, reset, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, reset))
    }
  }, [enabled, onLogout])
}
