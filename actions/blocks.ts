'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const createBlockSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid start time'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid end time'),
  slotDuration: z.coerce.number().int().min(5).max(120),
})

export type BlockActionState = { error?: string; success?: boolean } | undefined

export async function createBlock(
  _prev: BlockActionState,
  formData: FormData
): Promise<BlockActionState> {
  await requireAdmin()

  const parsed = createBlockSchema.safeParse({
    date: formData.get('date'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    slotDuration: formData.get('slotDuration'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { date, startTime, endTime, slotDuration } = parsed.data

  const slots: { start_time: string; end_time: string }[] = []
  let current = new Date(`${date}T${startTime}:00`)
  const end = new Date(`${date}T${endTime}:00`)

  if (current >= end) {
    return { error: 'Start time must be before end time.' }
  }

  while (current < end) {
    const slotEnd = new Date(current.getTime() + slotDuration * 60 * 1000)
    if (slotEnd > end) {
      break
    }
    slots.push({
      start_time: current.toISOString(),
      end_time: slotEnd.toISOString(),
    })
    current = slotEnd
  }

  if (slots.length === 0) {
    return { error: 'No slots fit in the given time range.' }
  }

  const admin = createAdminClient()

  const { data: block, error: blockError } = await admin
    .from('audition_blocks')
    .insert({
      date,
      start_time: startTime,
      end_time: endTime,
      slot_duration: slotDuration,
    })
    .select('id')
    .single()

  if (blockError || !block) {
    return { error: 'Failed to create block.' }
  }

  const { error: slotError } = await admin
    .from('audition_slots')
    .insert(slots.map((slot) => ({ ...slot, block_id: block.id })))

  if (slotError) {
    await admin.from('audition_blocks').delete().eq('id', block.id)
    return { error: 'Failed to create slots.' }
  }

  revalidatePath('/admin/slots')
  revalidatePath('/schedule')
  return { success: true }
}

export async function deleteBlock(blockId: string): Promise<BlockActionState> {
  await requireAdmin()

  if (!z.string().uuid().safeParse(blockId).success) {
    return { error: 'Invalid block ID.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('audition_blocks').delete().eq('id', blockId)

  if (error) {
    return { error: 'Failed to delete block.' }
  }

  revalidatePath('/admin/slots')
  revalidatePath('/schedule')
  return { success: true }
}
