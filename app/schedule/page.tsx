import Link from 'next/link'
import { SlotList } from '@/components/SlotList'
import { buttonVariants } from '@/components/ui/button-variants'
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
    <main className="min-h-screen flex flex-col justify-center p-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-14">
        <div>
          <p className="text-sm tracking-[0.4em] uppercase text-primary mb-2">Mixed Company</p>
          <h1 className="font-display text-7xl tracking-wide leading-none">Audition Schedule</h1>
        </div>
        <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          ← Dashboard
        </Link>
      </div>

      <SlotList blocks={normalizedBlocks} mySlotId={mySlotData?.id ?? null} />
    </main>
  )
}
