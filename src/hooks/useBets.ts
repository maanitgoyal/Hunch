import { useState, useEffect, useCallback } from 'react'
import { getUserBets } from '../lib/betting'
import { supabase } from '../lib/supabase'

export function useBets(userId: string | undefined) {
  const [bets, setBets]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<any>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await getUserBets(userId)
    setBets(data ?? [])
    setError(error)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
    if (!userId) return

    const channel = supabase
      .channel(`bets-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bets', filter: `user_id=eq.${userId}` },
        load
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [load, userId])

  const active   = bets.filter((b) => b.status === 'pending')
  const settled  = bets.filter((b) => b.status !== 'pending')

  return { bets, active, settled, loading, error, refresh: load }
}
