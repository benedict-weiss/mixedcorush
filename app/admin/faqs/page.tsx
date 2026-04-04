import { FaqEditor } from '@/components/FaqEditor'
import { createAdminClient } from '@/lib/supabase/admin'

type Faq = {
  id: string
  question: string
  answer: string
  sort_order: number
}

export default async function AdminFaqsPage() {
  const admin = createAdminClient()

  const { data: faqs } = await admin
    .from('faqs')
    .select('id, question, answer, sort_order')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Manage FAQs</h1>
      <FaqEditor faqs={(faqs as Faq[] | null) ?? []} />
    </div>
  )
}
