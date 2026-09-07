import { BlockForm } from '@/components/BlockForm'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

type SlotAgg = {
  id: string
  start_time: string
  end_time: string
  rushee_id: string | null
  users: { name: string; email: string; voice_part: string | null } | null
}

type BlockRow = {
  id: string
  date: string
  start_time: string
  end_time: string
  slot_duration: number
  audition_slots: SlotAgg[]
}

export default async function AdminSlotsPage() {
  await requireAdmin()
  const admin = createAdminClient()

  const { data: blocks } = await admin
    .from('audition_blocks')
    .select(
      `
      id,
      date,
      start_time,
      end_time,
      slot_duration,
      audition_slots(
        id,
        start_time,
        end_time,
        rushee_id,
        users(name, email, voice_part)
      )
    `
    )
    .order('date', { ascending: true })

  const normalizedBlocks = ((blocks as BlockRow[] | null) ?? []).map((block) => {
    const slots = [...(block.audition_slots ?? [])].sort((a, b) =>
      a.start_time.localeCompare(b.start_time)
    )

    return {
      id: block.id,
      date: block.date,
      start_time: block.start_time,
      end_time: block.end_time,
      slot_duration: block.slot_duration,
      total: slots.length,
      claimed: slots.filter((slot) => slot.rushee_id !== null).length,
      slots: slots.map((slot) => ({
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        rushee: slot.users
          ? {
              name: slot.users.name,
              email: slot.users.email,
              voice_part: slot.users.voice_part,
            }
          : null,
      })),
    }
  })

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide leading-none mb-6">Manage Slots</h1>
      <BlockForm blocks={normalizedBlocks} />
    </div>
  )
}
