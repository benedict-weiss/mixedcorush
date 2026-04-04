import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminDashboardPage() {
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
    { label: 'Total Rushees', value: totalRushees ?? 0 },
    { label: 'Scheduled', value: scheduledCount ?? 0 },
    { label: 'Unassigned Voice Parts', value: unassignedCount ?? 0 },
  ]

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border p-6">
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
