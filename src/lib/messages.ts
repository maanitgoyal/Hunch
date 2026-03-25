import { supabase } from './supabase'

export async function getMessages(lobbyId: string, limit = 50) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, content, created_at, user_id, users(display_name, colleges(primary_color, abbreviation))')
    .eq('lobby_id', lobbyId)
    .order('created_at', { ascending: true })
    .limit(limit)
  return { data: data ?? [], error }
}

export async function sendMessage(lobbyId: string, userId: string, content: string) {
  const { error } = await supabase
    .from('messages')
    .insert({ lobby_id: lobbyId, user_id: userId, content: content.trim() })
  return { error }
}

export function subscribeToMessages(lobbyId: string, onNew: (msg: any) => void) {
  return supabase
    .channel(`messages:${lobbyId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `lobby_id=eq.${lobbyId}` },
      (payload) => onNew(payload.new)
    )
    .subscribe()
}
