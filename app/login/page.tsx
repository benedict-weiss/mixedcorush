import { LoginForm } from '@/components/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <LoginForm defaultTab={tab === 'signup' ? 'signup' : 'login'} />
    </main>
  )
}
