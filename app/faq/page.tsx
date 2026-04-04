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
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs tracking-[0.4em] uppercase text-primary mb-1">Mixed Company</p>
          <h1 className="font-display text-4xl tracking-wide leading-none">FAQ</h1>
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
