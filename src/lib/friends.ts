import { supabase } from './supabase'

export async function searchUsers(query: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, display_name, coins, colleges(name, abbreviation, logo_url, primary_color)')
    .ilike('display_name', `%${query}%`)
    .limit(10)
  return { data: data ?? [], error }
}

export async function sendFriendRequest(senderId: string, receiverId: string) {
  const { error } = await supabase
    .from('friendships')
    .insert({ sender_id: senderId, receiver_id: receiverId })
  return { error }
}

export async function respondToRequest(friendshipId: string, status: string) {
  const { error } = await supabase
    .from('friendships')
    .update({ status })
    .eq('id', friendshipId)
  return { error }
}

export async function removeFriend(friendshipId: string) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)
  return { error }
}

export async function getFriends(userId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id, status, sender_id, receiver_id, created_at,
      sender:sender_id   ( id, display_name, coins, colleges(name, abbreviation, logo_url, primary_color) ),
      receiver:receiver_id ( id, display_name, coins, colleges(name, abbreviation, logo_url, primary_color) )
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq('status', 'accepted')
  if (error) return { data: [], error }

  const friends = (data ?? []).map((f: any) =>
    f.sender_id === userId ? { friendshipId: f.id, ...f.receiver } : { friendshipId: f.id, ...f.sender }
  )
  return { data: friends }
}

export async function getPendingRequests(userId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id, sender_id, created_at,
      sender:sender_id ( id, display_name, coins, colleges(name, abbreviation, logo_url, primary_color) )
    `)
    .eq('receiver_id', userId)
    .eq('status', 'pending')
  return { data: data ?? [], error }
}

export async function getFriendshipStatus(userId: string, otherId: string) {
  const { data } = await supabase
    .from('friendships')
    .select('id, status, sender_id')
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`
    )
    .maybeSingle()
  return data
}
