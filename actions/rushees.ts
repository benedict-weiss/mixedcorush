'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { VOICE_PARTS } from '@/lib/voice-parts'

const assignSchema = z.object({
  rusheeId: z.string().uuid(),
  voicePart: z.enum(VOICE_PARTS),
})

export type RusheeActionState = { error?: string; success?: boolean } | undefined

export async function assignVoicePart(
  _prev: RusheeActionState,
  formData: FormData
): Promise<RusheeActionState> {
  await requireAdmin()

  const parsed = assignSchema.safeParse({
    rusheeId: formData.get('rusheeId'),
    voicePart: formData.get('voicePart'),
  })

  if (!parsed.success) {
    return { error: 'Invalid input.' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('users')
    .update({ voice_part: parsed.data.voicePart })
    .eq('id', parsed.data.rusheeId)
    .eq('role', 'RUSHEE')

  if (error) {
    return { error: 'Failed to assign voice part.' }
  }

  revalidatePath('/admin/rushees')
  return { success: true }
}

export async function deleteRushee(rusheeId: string): Promise<RusheeActionState> {
  await requireAdmin()

  if (!z.string().uuid().safeParse(rusheeId).success) {
    return { error: 'Invalid rushee ID.' }
  }

  const admin = createAdminClient()

  // Verify target exists and is a RUSHEE (not an admin)
  const { data: user } = await admin
    .from('users')
    .select('id')
    .eq('id', rusheeId)
    .eq('role', 'RUSHEE')
    .single()

  if (!user) {
    return { error: 'Rushee not found.' }
  }

  // Deleting the auth user cascades to the users table and frees any held slot (ON DELETE SET NULL)
  const { error } = await admin.auth.admin.deleteUser(rusheeId)

  if (error) {
    return { error: 'Failed to delete rushee.' }
  }

  revalidatePath('/admin/rushees')
  return { success: true }
}
