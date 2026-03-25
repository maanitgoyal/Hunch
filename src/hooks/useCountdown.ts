import { useState, useEffect } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(targetDate: string): TimeLeft | null {
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  }
}

export function useCountdown(targetDate: string | null | undefined): TimeLeft | null {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => targetDate ? getTimeLeft(targetDate) : null)

  useEffect(() => {
    if (!targetDate) return
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return timeLeft
}

export function formatCountdown(t: TimeLeft | null): string | null {
  if (!t) return null
  if (t.days > 0)   return `${t.days}d ${t.hours}h`
  if (t.hours > 0)  return `${t.hours}h ${t.minutes}m`
  return `${t.minutes}m ${String(t.seconds).padStart(2, '0')}s`
}
