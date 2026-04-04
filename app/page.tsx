import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">Mixed Company</h1>
      <p className="mb-8 max-w-md text-lg text-muted-foreground">
        Yale&apos;s premier co-ed a cappella group. Rush starts here.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className={buttonVariants()}>
          Log In
        </Link>
        <Link href="/login?tab=signup" className={buttonVariants({ variant: 'outline' })}>
          Sign Up
        </Link>
      </div>
    </main>
  )
}
