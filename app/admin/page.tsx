import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminDashboardPage() {
  await requireAdmin()
  const admin = createAdminClient()

  const [{ count: totalRushees }, { count: scheduledCount }, { count: unassignedCount }] =
    await Promise.all([
      admin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'RUSHEE'),
      admin
        .from('audition_slots')
        .select('*', { count: 'exact', head: true })
        .not('rushee_id', 'is', null),
      admin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'RUSHEE')
        .is('voice_part', null),
    ])

  const stats = [
    { label: 'Total Rushees', value: totalRushees ?? 0, accent: true },
    { label: 'Scheduled', value: scheduledCount ?? 0, accent: false },
    { label: 'Unassigned Voice Parts', value: unassignedCount ?? 0, accent: false },
  ]

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-4xl tracking-wide leading-none mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-px bg-border">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card p-8">
            <p
              className={`font-display text-7xl leading-none tracking-wide mb-3 ${
                stat.accent ? 'text-primary' : ''
              }`}
            >
              {stat.value}
            </p>
            <p className="text-xs tracking-widest text-muted-foreground uppercase">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
