import { RusheeTable } from '@/components/RusheeTable'
import { createAdminClient } from '@/lib/supabase/admin'

type RusheeRow = {
  id: string
  name: string
  email: string
  voice_part: string | null
  audition_slots: { start_time: string }[] | { start_time: string } | null
}

export default async function AdminRusheesPage() {
  const admin = createAdminClient()

  const { data: rushees } = await admin
    .from('users')
    .select(
      `
      id,
      name,
      email,
      voice_part,
      audition_slots(start_time)
    `
    )
    .eq('role', 'RUSHEE')
    .order('name', { ascending: true })

  const normalized = ((rushees as RusheeRow[] | null) ?? []).map((rushee) => ({
    ...rushee,
    audition_slots: Array.isArray(rushee.audition_slots)
      ? rushee.audition_slots[0] ?? null
      : rushee.audition_slots,
  }))

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-4xl tracking-wide leading-none mb-6">Manage Rushees</h1>
      <RusheeTable rushees={normalized} />
    </div>
  )
}
