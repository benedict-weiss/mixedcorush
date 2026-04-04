import Link from 'next/link'
import { logOut } from '@/actions/auth'
import { buttonVariants } from '@/components/ui/button-variants'
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
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-1">Mixed Company</p>
          <h1 className="font-display text-5xl tracking-wide leading-none">{profile.name}</h1>
        </div>
        <form action={logOut}>
          <button className={buttonVariants({ variant: 'outline', size: 'sm' })} type="submit">
            Log Out
          </button>
        </form>
      </div>

      {/* Status grid */}
      <div className="grid grid-cols-2 gap-px bg-border mb-10">
        <div className="bg-card p-6">
          <p className="text-xs tracking-widest text-muted-foreground uppercase mb-3">Voice Part</p>
          {profile.voice_part ? (
            <p className="font-display text-3xl text-primary tracking-wide leading-none">
              {profile.voice_part}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">Not yet assigned</p>
          )}
        </div>
        <div className="bg-card p-6">
          <p className="text-xs tracking-widest text-muted-foreground uppercase mb-3">
            Audition Slot
          </p>
          {mySlot ? (
            <>
              <p className="font-display text-2xl leading-tight tracking-wide">
                {new Date(mySlot.start_time).toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {new Date(mySlot.start_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' – '}
                {new Date(mySlot.end_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No slot scheduled</p>
          )}
        </div>
      </div>

      {/* Nav actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/schedule"
          className={buttonVariants({ className: 'flex-1 tracking-widest uppercase text-xs' })}
        >
          View Schedule
        </Link>
        <Link
          href="/materials"
          className={buttonVariants({
            variant: 'outline',
            className: 'flex-1 tracking-widest uppercase text-xs',
          })}
        >
          Materials
        </Link>
        <Link
          href="/faq"
          className={buttonVariants({
            variant: 'outline',
            className: 'flex-1 tracking-widest uppercase text-xs',
          })}
        >
          FAQ
        </Link>
      </div>
    </main>
  )
}
