import Link from 'next/link'
import { logOut } from '@/actions/auth'
import { buttonVariants } from '@/components/ui/button-variants'
import { requireAdmin } from '@/lib/auth'

const navLinks = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/rushees', label: 'Rushees' },
  { href: '/admin/slots', label: 'Slots' },
  { href: '/admin/materials', label: 'Materials' },
  { href: '/admin/faqs', label: 'FAQs' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border bg-card px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-display text-2xl text-primary tracking-[0.2em] leading-none">
            ADMIN
          </span>
          <div className="w-px h-5 bg-border" aria-hidden="true" />
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-150 tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <form action={logOut}>
          <button className={buttonVariants({ variant: 'outline', size: 'sm' })} type="submit">
            Log Out
          </button>
        </form>
      </nav>
      <div className="p-8">{children}</div>
    </div>
  )
}
