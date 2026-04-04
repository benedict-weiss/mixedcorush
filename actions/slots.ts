'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type SlotActionState = { error?: string; success?: boolean } | undefined

export async function releaseSlot(): Promise<SlotActionState> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const admin = createAdminClient()
  await admin.from('audition_slots').update({ rushee_id: null }).eq('rushee_id', user.id)

  revalidatePath('/schedule')
  revalidatePath('/dashboard')
  return { success: true }
}
