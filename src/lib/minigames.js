import { supabase } from './supabase'

// ─── Number guess ───────────────────────────────────────────
export async function numberGuess({ userId, stake, guess }) {
  const { data, error } = await supabase.rpc('number_guess', {
    p_user_id: userId,
    p_stake:   stake,
    p_guess:   guess,
  })
  if (error) return { error }
  if (data?.error) return { error: { message: data.error } }
  return { data }
}

// ─── Coin flip ──────────────────────────────────────────────
export async function coinFlip({ userId, stake, choice }) {
  const { data, error } = await supabase.rpc('coin_flip', {
    p_user_id: userId,
    p_stake:   stake,
    p_choice:  choice,
  })
  if (error) return { error }
  if (data?.error) return { error: { message: data.error } }
  return { data }
}

// ─── Predictions ────────────────────────────────────────────
export async function submitPrediction({ gameId, userId, predictedWinnerId }) {
  const { data, error } = await supabase
    .from('predictions')
    .upsert({ game_id: gameId, user_id: userId, predicted_winner_id: predictedWinnerId ?? null },
             { onConflict: 'game_id,user_id' })
    .select()
    .single()
  return { data, error }
}

export async function getGamePredictions(gameId) {
  const { data, error } = await supabase
    .from('predictions')
    .select('predicted_winner_id')
    .eq('game_id', gameId)
  return { data, error }
}

export async function getMyPrediction(gameId, userId) {
  const { data, error } = await supabase
    .from('predictions')
    .select('predicted_winner_id')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .maybeSingle()
  return { data, error }
}

// ─── Draft picks ────────────────────────────────────────────
export async function saveDraftPick({ userId, collegeId, pickRank }) {
  const { data, error } = await supabase
    .from('draft_picks')
    .upsert({ user_id: userId, college_id: collegeId, pick_rank: pickRank },
             { onConflict: 'user_id,pick_rank' })
    .select()
    .single()
  return { data, error }
}

export async function removeDraftPick({ userId, pickRank }) {
  const { error } = await supabase
    .from('draft_picks')
    .delete()
    .eq('user_id', userId)
    .eq('pick_rank', pickRank)
  return { error }
}

export async function getMyDraftPicks(userId) {
  const { data, error } = await supabase
    .from('draft_picks')
    .select('pick_rank, college_id, colleges(id, name, abbreviation, logo_url, primary_color)')
    .eq('user_id', userId)
    .order('pick_rank')
  return { data, error }
}

export async function getColleges() {
  const { data, error } = await supabase
    .from('colleges')
    .select('id, name, abbreviation, logo_url, primary_color')
    .order('name')
  return { data, error }
}

// ─── Rivalry tracker ────────────────────────────────────────
export async function getRivalryRecord(collegeAId, collegeBId) {
  const { data, error } = await supabase
    .from('games')
    .select('home_college_id, away_college_id, winning_college_id')
    .eq('status', 'completed')
    .or(
      `and(home_college_id.eq.${collegeAId},away_college_id.eq.${collegeBId}),` +
      `and(home_college_id.eq.${collegeBId},away_college_id.eq.${collegeAId})`
    )
  if (error) return { data: null, error }

  let winsA = 0, winsB = 0, draws = 0
  for (const g of data ?? []) {
    if (g.winning_college_id === collegeAId)      winsA++
    else if (g.winning_college_id === collegeBId) winsB++
    else                                           draws++
  }
  return { data: { winsA, winsB, draws, total: data.length }, error: null }
}
