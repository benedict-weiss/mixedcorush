import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type UserProfile = {
  id: string
  email: string
  name: string
  role: 'RUSHEE' | 'ADMIN'
  voice_part: string | null
  created_at: string
}

export async function getAuthenticatedUser(): Promise<UserProfile> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return redirect('/login')
  }

  return profile as UserProfile
}

export async function requireAdmin(): Promise<UserProfile> {
  const profile = await getAuthenticatedUser()
  if (profile.role !== 'ADMIN') {
    return redirect('/dashboard')
  }
  return profile
}
