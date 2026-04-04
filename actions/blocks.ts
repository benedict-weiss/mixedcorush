'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Parse a date + time string ("HH:MM") entered in Eastern time and return
 * the corresponding UTC Date. Uses Intl to resolve EST/EDT automatically.
 */
function parseEastern(dateStr: string, timeStr: string): Date {
  // Treat input as UTC first to get an approximation
  const approx = new Date(`${dateStr}T${timeStr}:00Z`)

  // Find what Eastern wall-clock time this UTC moment corresponds to
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = fmt.formatToParts(approx)
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)!.value)

  // Treat that Eastern wall-clock reading as a UTC timestamp
  const easternAsUtc = Date.UTC(
    get('year'), get('month') - 1, get('day'),
    get('hour'), get('minute'), get('second')
  )

  // The offset is how far the approx UTC is from what Eastern thinks it is
  const offsetMs = approx.getTime() - easternAsUtc

  // Apply: shift the entered time by that offset to get the true UTC moment
  return new Date(approx.getTime() + offsetMs)
}

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
  let current = parseEastern(date, startTime)
  const end = parseEastern(date, endTime)

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
