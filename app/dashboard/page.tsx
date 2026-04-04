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
    <main className="min-h-screen flex flex-col justify-center p-12 max-w-5xl mx-auto">
      {/* Name */}
      <div className="mb-12">
        <p className="text-sm tracking-[0.4em] uppercase text-primary mb-2">Welcome</p>
        <h1
          className="font-display tracking-wide leading-none"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}
        >
          {profile.name}
        </h1>
      </div>

      {/* Status grid */}
      <div className="grid grid-cols-2 gap-px bg-border mb-3">
        <div className="bg-card p-8">
          <p className="text-xs tracking-widest text-muted-foreground uppercase mb-4">Voice Part</p>
          {profile.voice_part ? (
            <p className="font-display text-5xl text-primary tracking-wide leading-none">
              {profile.voice_part}
            </p>
          ) : (
            <p className="text-muted-foreground">Not yet assigned</p>
          )}
        </div>
        <div className="bg-card p-8">
          <p className="text-xs tracking-widest text-muted-foreground uppercase mb-4">
            Audition Slot
          </p>
          {mySlot ? (
            <>
              <p className="font-display text-4xl leading-tight tracking-wide">
                {new Date(mySlot.start_time).toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-muted-foreground mt-2">
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
            <p className="text-muted-foreground">No slot scheduled</p>
          )}
        </div>
      </div>

      {/* Nav actions */}
      <div className="flex flex-col gap-px sm:flex-row mb-px">
        <Link
          href="/schedule"
          className={buttonVariants({ variant: 'outline', className: 'flex-1 tracking-widest uppercase text-xs' })}
        >
          Schedule
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
          FAQs
        </Link>
      </div>

      <form action={logOut}>
        <button
          className={buttonVariants({
            variant: 'outline',
            className: 'w-full tracking-widest uppercase text-xs',
          })}
          type="submit"
        >
          Log Out
        </button>
      </form>
    </main>
  )
}
