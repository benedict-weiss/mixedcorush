import Link from 'next/link'
import { logOut } from '@/actions/auth'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const profile = await getAuthenticatedUser()

  const supabase = await createClient()
  const { data: mySlot } = await supabase
    .from('audition_slots')
    .select('id, start_time, end_time')
    .eq('rushee_id', profile.id)
    .maybeSingle()

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl tracking-wide leading-none">Welcome, {profile.name}</h1>
        <form action={logOut}>
          <button className={buttonVariants({ variant: 'outline', size: 'sm' })} type="submit">
            Log Out
          </button>
        </form>
      </div>

      <div className="grid gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Voice Part</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.voice_part ? (
              <Badge variant="secondary">{profile.voice_part}</Badge>
            ) : (
              <p className="text-muted-foreground text-sm">Not yet assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audition Slot</CardTitle>
          </CardHeader>
          <CardContent>
            {mySlot ? (
              <p className="text-sm">
                {new Date(mySlot.start_time).toLocaleString([], {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' - '}
                {new Date(mySlot.end_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">No slot scheduled</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/schedule" className={buttonVariants({ className: 'flex-1' })}>
          View Schedule
        </Link>
        <Link
          href="/materials"
          className={buttonVariants({ variant: 'outline', className: 'flex-1' })}
        >
          Audition Materials
        </Link>
        <Link href="/faq" className={buttonVariants({ variant: 'outline', className: 'flex-1' })}>
          FAQ
        </Link>
      </div>
    </main>
  )
}
