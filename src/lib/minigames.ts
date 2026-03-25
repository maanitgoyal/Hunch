import { supabase } from './supabase'

export async function numberGuess({ userId, stake, guess }: { userId: string; stake: number; guess: number }) {
  const { data, error } = await supabase.rpc('number_guess', {
    p_user_id: userId,
    p_stake:   stake,
    p_guess:   guess,
  })
  if (error) return { error }
  if (data?.error) return { error: { message: data.error } }
  return { data }
}

export async function coinFlip({ userId, stake, choice }: { userId: string; stake: number; choice: string }) {
  const { data, error } = await supabase.rpc('coin_flip', {
    p_user_id: userId,
    p_stake:   stake,
    p_choice:  choice,
  })
  if (error) return { error }
  if (data?.error) return { error: { message: data.error } }
  return { data }
}

export async function submitPrediction({ gameId, userId, predictedWinnerId }: { gameId: string; userId: string; predictedWinnerId: string | null }) {
  const { data, error } = await supabase
    .from('predictions')
    .upsert({ game_id: gameId, user_id: userId, predicted_winner_id: predictedWinnerId ?? null },
             { onConflict: 'game_id,user_id' })
    .select()
    .single()
  return { data, error }
}

export async function getGamePredictions(gameId: string) {
  const { data, error } = await supabase
    .from('predictions')
    .select('predicted_winner_id')
    .eq('game_id', gameId)
  return { data, error }
}

export async function getMyPrediction(gameId: string, userId: string) {
  const { data, error } = await supabase
    .from('predictions')
    .select('predicted_winner_id')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .maybeSingle()
  return { data, error }
}

export async function saveDraftPick({ userId, collegeId, pickRank }: { userId: string; collegeId: string; pickRank: number }) {
  const { data, error } = await supabase
    .from('draft_picks')
    .upsert({ user_id: userId, college_id: collegeId, pick_rank: pickRank },
             { onConflict: 'user_id,pick_rank' })
    .select()
    .single()
  return { data, error }
}

export async function removeDraftPick({ userId, pickRank }: { userId: string; pickRank: number }) {
  const { error } = await supabase
    .from('draft_picks')
    .delete()
    .eq('user_id', userId)
    .eq('pick_rank', pickRank)
  return { error }
}

export async function getMyDraftPicks(userId: string) {
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

export async function getRivalryRecord(collegeAId: string, collegeBId: string) {
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
  return { data: { winsA, winsB, draws, total: (data ?? []).length }, error: null }
}
