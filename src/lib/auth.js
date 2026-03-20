import { supabase } from './supabase'

// ─── Signup: creates auth user + sends OTP confirmation email ─
export async function signUp({ email, password }) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

// ─── Verify the OTP sent after signUp ─────────────────────────
export async function verifySignupOTP(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  })
  return { data, error }
}

// ─── Login: email + password, no OTP needed ───────────────────
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

// ─── Resend OTP confirmation email ────────────────────────────
export async function resendConfirmation(email) {
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  return { error }
}

// ─── Profile ──────────────────────────────────────────────────
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*, colleges(*)')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function createProfile({ userId, displayName, collegeId }) {
  const { data, error } = await supabase
    .from('users')
    .insert({ id: userId, display_name: displayName, college_id: collegeId })
    .select('*, colleges(*)')
    .single()
  return { data, error }
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('*, colleges(*)')
    .single()
  return { data, error }
}

// ─── Sign out ─────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Reset password email
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/profile',
  })
  return { error }
}

// Update auth password
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return { error }
}
