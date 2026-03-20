import { useEffect, useRef } from 'react'
import { signOut } from '../lib/auth'

const INACTIVITY_MS = 2 * 60 * 60 * 1000 // 2 hours

const ACTIVITY_EVENTS = [
  'mousemove', 'mousedown', 'keydown',
  'scroll', 'touchstart', 'click', 'wheel',
]

/**
 * Signs the user out after INACTIVITY_MS of no interaction.
 * Only active when `enabled` is true (i.e. user is logged in).
 */
export function useInactivityLogout(enabled, onLogout) {
  const timerRef = useRef(null)

  useEffect(() => {
    if (!enabled) return

    function reset() {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(async () => {
        await signOut()
        onLogout?.()
      }, INACTIVITY_MS)
    }

    // Start timer immediately
    reset()

    // Reset on any activity
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, reset, { passive: true }))

    return () => {
      clearTimeout(timerRef.current)
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, reset))
    }
  }, [enabled, onLogout])
}
