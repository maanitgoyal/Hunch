import { supabase } from './supabase'

export async function signUp({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

export async function verifySignupOTP(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
  return { data, error }
}

export async function signIn({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function resendConfirmation(email: string) {
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  return { error }
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*, colleges(*)')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function createProfile({ userId, displayName, collegeId }: { userId: string; displayName: string; collegeId: string }) {
  const { data, error } = await supabase
    .from('users')
    .insert({ id: userId, display_name: displayName, college_id: collegeId })
    .select('*, colleges(*)')
    .single()
  return { data, error }
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('*, colleges(*)')
    .single()
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/profile',
  })
  return { error }
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return { error }
}
