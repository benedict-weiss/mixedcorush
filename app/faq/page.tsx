import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
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
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">FAQ</h1>
        <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          ← Dashboard
        </Link>
      </div>

      {!faqs || faqs.length === 0 ? (
        <p className="text-muted-foreground">No FAQs yet.</p>
      ) : (
        <div className="space-y-6">
          {(faqs as Faq[]).map((faq) => (
            <div key={faq.id}>
              <h2 className="font-semibold mb-1">{faq.question}</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{faq.answer}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
