import { BlockForm } from '@/components/BlockForm'
import { createAdminClient } from '@/lib/supabase/admin'

type SlotAgg = {
  id: string
  rushee_id: string | null
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
      audition_slots(id, rushee_id)
    `
    )
    .order('date', { ascending: true })

  const normalizedBlocks = ((blocks as BlockRow[] | null) ?? []).map((block) => {
    const slots = block.audition_slots ?? []

    return {
      id: block.id,
      date: block.date,
      start_time: block.start_time,
      end_time: block.end_time,
      slot_duration: block.slot_duration,
      total: slots.length,
      claimed: slots.filter((slot) => slot.rushee_id !== null).length,
    }
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Manage Slots</h1>
      <BlockForm blocks={normalizedBlocks} />
    </div>
  )
}
