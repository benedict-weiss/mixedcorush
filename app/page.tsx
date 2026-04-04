import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button-variants'

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Decorative staff lines */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {[18, 27, 36, 45, 54].map((top) => (
          <div
            key={top}
            className="absolute w-full h-px bg-foreground/[0.04]"
            style={{ top: `${top}%` }}
          />
        ))}
      </div>

      {/* Corner brackets */}
      <div
        className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-primary/40"
        aria-hidden="true"
      />
      <div
        className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-primary/40"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-primary/40"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-primary/40"
        aria-hidden="true"
      />

      <div className="relative z-10 text-center px-8 max-w-4xl w-full">
        {/* Eyebrow */}
        <p className="text-xs tracking-[0.6em] uppercase text-primary mb-8 font-medium">
          Yale&apos;s Premier Co‑Ed A Cappella
        </p>

        {/* Main wordmark */}
        <h1 className="font-display leading-[0.88] tracking-wide uppercase text-foreground">
          <span className="block text-[clamp(4rem,15vw,10rem)]">Mixed</span>
          <span className="block text-[clamp(4rem,15vw,10rem)]">Company</span>
        </h1>

        {/* Yellow rule with Rush label */}
        <div className="flex items-center gap-5 my-8 justify-center">
          <div className="h-px flex-1 bg-primary max-w-[6rem]" />
          <span className="font-display text-3xl text-primary tracking-[0.3em] uppercase">
            Rush
          </span>
          <div className="h-px flex-1 bg-primary max-w-[6rem]" />
        </div>

        {/* Sub-copy */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-10 max-w-xs mx-auto">
          Auditions are open. Claim your slot and access materials — all in one place.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 justify-center">
          <Link href="/login" className={buttonVariants({ className: 'px-8 font-medium tracking-widest uppercase text-xs' })}>
            Log In
          </Link>
          <Link
            href="/login?tab=signup"
            className={buttonVariants({ variant: 'outline', className: 'px-8 font-medium tracking-widest uppercase text-xs' })}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  )
}
