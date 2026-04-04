import { LoginForm } from '@/components/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-10">
      <div className="text-center">
        <p className="text-xs tracking-[0.5em] uppercase text-primary mb-3">Yale A Cappella</p>
        <h1 className="font-display text-[3.5rem] leading-none tracking-wide">Mixed Company</h1>
      </div>
      <LoginForm defaultTab={tab === 'signup' ? 'signup' : 'login'} />
    </main>
  )
}
