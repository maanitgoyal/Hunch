import { useState, useEffect, useCallback } from 'react'
import { getGames, getGameWithMarkets } from '../lib/betting'
import { supabase } from '../lib/supabase'

export function useGames(statusFilter: string | null = null) {
  const [games, setGames]     = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<any>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await getGames(statusFilter)
    setGames(data ?? [])
    setError(error)
    setLoading(false)
  }, [statusFilter])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('games-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  return { games, loading, error, refresh: load }
}

export function useGame(gameId: string | undefined) {
  const [game, setGame]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<any>(null)

  const load = useCallback(async () => {
    if (!gameId) return
    setLoading(true)
    const { data, error } = await getGameWithMarkets(gameId)
    setGame(data ?? null)
    setError(error)
    setLoading(false)
  }, [gameId])

  useEffect(() => {
    load()
    const channel = supabase
      .channel(`game-${gameId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bet_markets', filter: `game_id=eq.${gameId}` }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load, gameId])

  return { game, loading, error, refresh: load }
}
