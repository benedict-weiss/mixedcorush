'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export type SlotActionState = { error?: string; success?: boolean } | undefined
const slotIdSchema = z.string().uuid()

export async function claimSlot(slotId: string): Promise<SlotActionState> {
  if (!slotIdSchema.safeParse(slotId).success) {
    return { error: 'Invalid slot.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase.rpc('claim_slot', {
    p_slot_id: slotId,
  })

  if (error) {
    return { error: 'This slot is no longer available.' }
  }

  revalidatePath('/schedule')
  revalidatePath('/dashboard')
  return { success: true }
}

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
