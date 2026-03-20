import { supabase } from './supabase'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function createLobby({ name, gameId, userId }) {
  const invite_code = generateCode()
  const { data: lobby, error } = await supabase
    .from('lobbies')
    .insert({ name, invite_code, created_by: userId, game_id: gameId ?? null })
    .select()
    .single()
  if (error) return { error }

  await supabase.from('lobby_members').insert({ lobby_id: lobby.id, user_id: userId })
  return { data: lobby }
}

export async function joinLobby({ inviteCode, userId }) {
  const { data: lobby, error } = await supabase
    .from('lobbies')
    .select('*')
    .eq('invite_code', inviteCode.trim().toUpperCase())
    .single()
  if (error || !lobby) return { error: { message: 'Lobby not found — check the code' } }

  const { error: joinError } = await supabase
    .from('lobby_members')
    .insert({ lobby_id: lobby.id, user_id: userId })
  if (joinError) {
    if (joinError.code === '23505') return { error: { message: 'You are already in this lobby' } }
    return { error: joinError }
  }
  return { data: lobby }
}

export async function getMyLobbies(userId) {
  const { data, error } = await supabase
    .from('lobby_members')
    .select(`
      lobby_id,
      lobbies (
        id, name, invite_code, created_by, game_id, created_at,
        games ( id, status, sport,
          home_college:home_college_id ( name, abbreviation ),
          away_college:away_college_id ( name, abbreviation )
        )
      )
    `)
    .eq('user_id', userId)
  if (error) return { data: [], error }
  return { data: data.map((m) => m.lobbies).filter(Boolean) }
}

export async function getLobbyWithMembers(lobbyId) {
  const { data, error } = await supabase
    .from('lobbies')
    .select(`
      id, name, invite_code, created_by, game_id, created_at,
      games ( id, status, sport,
        home_college:home_college_id ( name, abbreviation ),
        away_college:away_college_id ( name, abbreviation )
      ),
      lobby_members (
        user_id,
        users ( id, display_name, coins,
          colleges ( name, abbreviation, logo_url, primary_color )
        )
      )
    `)
    .eq('id', lobbyId)
    .single()
  return { data, error }
}

export async function getLobbyLeaderboard(lobbyId, gameId) {
  const { data: lobby } = await getLobbyWithMembers(lobbyId)
  if (!lobby) return { data: [] }

  const members = lobby.lobby_members ?? []
  const userIds = members.map((m) => m.user_id)
  if (userIds.length === 0) return { data: [] }

  let query = supabase
    .from('bets')
    .select('user_id, stake, payout, status, game_id')
    .in('user_id', userIds)

  if (gameId) query = query.eq('game_id', gameId)

  const { data: bets } = await query

  const rows = members.map((m) => {
    const user      = m.users
    const userBets  = (bets ?? []).filter((b) => b.user_id === m.user_id)
    const settled   = userBets.filter((b) => b.status !== 'pending')
    const won       = settled.filter((b) => b.status === 'won')
    const totalStaked = userBets.reduce((s, b) => s + b.stake, 0)
    const totalPaid   = won.reduce((s, b) => s + (b.payout ?? 0), 0)
    const netPL       = totalPaid - settled.reduce((s, b) => s + b.stake, 0)

    return {
      user_id:      m.user_id,
      display_name: user.display_name,
      coins:        user.coins,
      college:      user.colleges,
      total_bets:   userBets.length,
      wins:         won.length,
      settled:      settled.length,
      win_rate:     settled.length > 0 ? Math.round(won.length / settled.length * 100) : 0,
      net_pl:       netPL,
    }
  })

  rows.sort((a, b) => gameId ? b.net_pl - a.net_pl : b.coins - a.coins)
  return { data: rows }
}

export async function leaveLobby({ lobbyId, userId }) {
  return supabase
    .from('lobby_members')
    .delete()
    .eq('lobby_id', lobbyId)
    .eq('user_id', userId)
}

export async function getCollegeLeaderboard() {
  const { data, error } = await supabase
    .from('college_leaderboard_view')
    .select('*')
    .order('avg_win_rate', { ascending: false, nullsFirst: false })
  return { data: data ?? [], error }
}
