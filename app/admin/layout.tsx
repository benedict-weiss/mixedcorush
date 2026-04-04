import Link from 'next/link'
import { logOut } from '@/actions/auth'
import { buttonVariants } from '@/components/ui/button'
import { requireAdmin } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="min-h-screen">
      <nav className="border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold">Admin</span>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/admin/rushees" className="text-sm text-muted-foreground hover:text-foreground">
            Rushees
          </Link>
          <Link href="/admin/slots" className="text-sm text-muted-foreground hover:text-foreground">
            Slots
          </Link>
          <Link
            href="/admin/materials"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Materials
          </Link>
          <Link href="/admin/faqs" className="text-sm text-muted-foreground hover:text-foreground">
            FAQs
          </Link>
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
