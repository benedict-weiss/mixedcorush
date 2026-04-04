import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button-variants'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

type Faq = {
  id: string
  question: string
  answer: string
}

export default async function FaqPage() {
  await getAuthenticatedUser()
  const supabase = await createClient()

  const { data: faqs } = await supabase
    .from('faqs')
    .select('id, question, answer')
    .order('sort_order', { ascending: true })

  return (
    <main className="min-h-screen flex flex-col justify-center p-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-14">
        <div>
          <p className="text-sm tracking-[0.4em] uppercase text-primary mb-2">Mixed Company</p>
          <h1 className="font-display text-7xl tracking-wide leading-none">FAQs</h1>
        </div>
        <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          ← Dashboard
        </Link>
      </div>

      {!faqs || faqs.length === 0 ? (
        <p className="text-muted-foreground">No FAQs yet.</p>
      ) : (
        <div className="divide-y divide-border">
          {(faqs as Faq[]).map((faq) => (
            <div key={faq.id} className="py-8">
              <h2 className="font-semibold mb-2 leading-snug">{faq.question}</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
