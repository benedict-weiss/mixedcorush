import Link from 'next/link'
import { SlotList } from '@/components/SlotList'
import { buttonVariants } from '@/components/ui/button'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

type SlotRow = {
  id: string
  start_time: string
  end_time: string
  rushee_id: string | null
}

type BlockRow = {
  id: string
  date: string
  audition_slots: SlotRow[]
}

export default async function SchedulePage() {
  const profile = await getAuthenticatedUser()
  const supabase = await createClient()

  const { data: blocks } = await supabase
    .from('audition_blocks')
    .select('id, date, audition_slots(id, start_time, end_time, rushee_id)')
    .order('date', { ascending: true })

  const { data: mySlotData } = await supabase
    .from('audition_slots')
    .select('id')
    .eq('rushee_id', profile.id)
    .maybeSingle()

  const normalizedBlocks = ((blocks as BlockRow[] | null) ?? []).map((block) => ({
    id: block.id,
    date: block.date,
    slots: (block.audition_slots ?? []).sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }))

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Audition Schedule</h1>
        <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          ← Dashboard
        </Link>
      </div>

      <SlotList blocks={normalizedBlocks} mySlotId={mySlotData?.id ?? null} />
    </main>
  )
}
