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
