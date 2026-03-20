import { supabase } from './supabase'

export async function placeBet({ userId, marketId, gameId, selectedOptionKey, stake }) {
  const { data, error } = await supabase.rpc('place_bet', {
    p_user_id: userId,
    p_market_id: marketId,
    p_game_id: gameId,
    p_selected_option_key: selectedOptionKey,
    p_stake: stake,
  })
  if (error) return { error }
  if (data?.error) return { error: { message: data.error } }
  return { data }
}

export async function claimBailout(userId) {
  const { data, error } = await supabase.rpc('claim_bailout', {
    p_user_id: userId,
  })
  if (error) return { error }
  if (data?.error) return { error: { message: data.error } }
  return { data }
}

export async function getUserBets(userId) {
  const { data, error } = await supabase
    .from('bets')
    .select(`
      *,
      bet_markets (
        id, market_type, description, options, correct_option_key, status
      ),
      games (
        id, sport, scheduled_at, status, home_score, away_score,
        home_college:colleges!games_home_college_id_fkey (id, name, abbreviation, logo_url, primary_color),
        away_college:colleges!games_away_college_id_fkey (id, name, abbreviation, logo_url, primary_color)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function getGames(statusFilter = null) {
  let query = supabase
    .from('games')
    .select(`
      *,
      home_college:colleges!games_home_college_id_fkey (id, name, abbreviation, logo_url, primary_color, secondary_color),
      away_college:colleges!games_away_college_id_fkey (id, name, abbreviation, logo_url, primary_color, secondary_color),
      winning_college:colleges!games_winning_college_id_fkey (id, name, abbreviation),
      bet_markets (id, status)
    `)
    .order('scheduled_at', { ascending: true })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getGameWithMarkets(gameId) {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      home_college:colleges!games_home_college_id_fkey (id, name, abbreviation, logo_url, primary_color, secondary_color),
      away_college:colleges!games_away_college_id_fkey (id, name, abbreviation, logo_url, primary_color, secondary_color),
      winning_college:colleges!games_winning_college_id_fkey (id, name, abbreviation, logo_url),
      bet_markets (*)
    `)
    .eq('id', gameId)
    .single()
  return { data, error }
}

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .order('coins', { ascending: false })
  return { data, error }
}
