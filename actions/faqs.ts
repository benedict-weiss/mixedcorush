'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const faqSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(5000),
})

export type FaqActionState = { error?: string; success?: boolean } | undefined

export async function createFaq(
  _prev: FaqActionState,
  formData: FormData
): Promise<FaqActionState> {
  await requireAdmin()

  const parsed = faqSchema.safeParse({
    question: formData.get('question'),
    answer: formData.get('answer'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const admin = createAdminClient()
  const { count } = await admin.from('faqs').select('*', { count: 'exact', head: true })

  const { error } = await admin
    .from('faqs')
    .insert({ ...parsed.data, sort_order: (count ?? 0) + 1 })

  if (error) {
    return { error: 'Failed to create FAQ.' }
  }

  revalidatePath('/admin/faqs')
  revalidatePath('/faq')
  return { success: true }
}

export async function updateFaq(
  _prev: FaqActionState,
  formData: FormData
): Promise<FaqActionState> {
  await requireAdmin()

  const id = formData.get('id')
  if (!z.string().uuid().safeParse(id).success) {
    return { error: 'Invalid FAQ ID.' }
  }

  const parsed = faqSchema.safeParse({
    question: formData.get('question'),
    answer: formData.get('answer'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('faqs').update(parsed.data).eq('id', id as string)

  if (error) {
    return { error: 'Failed to update FAQ.' }
  }

  revalidatePath('/admin/faqs')
  revalidatePath('/faq')
  return { success: true }
}

export async function deleteFaq(faqId: string): Promise<FaqActionState> {
  await requireAdmin()

  if (!z.string().uuid().safeParse(faqId).success) {
    return { error: 'Invalid FAQ ID.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('faqs').delete().eq('id', faqId)

  if (error) {
    return { error: 'Failed to delete FAQ.' }
  }

  revalidatePath('/admin/faqs')
  revalidatePath('/faq')
  return { success: true }
}

export async function moveFaq(
  faqId: string,
  direction: 'up' | 'down'
): Promise<FaqActionState> {
  await requireAdmin()

  if (!z.string().uuid().safeParse(faqId).success) {
    return { error: 'Invalid FAQ ID.' }
  }

  const admin = createAdminClient()
  const { data: faqs } = await admin.from('faqs').select('id, sort_order').order('sort_order', {
    ascending: true,
  })

  if (!faqs) {
    return { error: 'Could not load FAQs.' }
  }

  const idx = faqs.findIndex((faq) => faq.id === faqId)
  if (idx === -1) {
    return { error: 'FAQ not found.' }
  }

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= faqs.length) {
    return { success: true }
  }

  const currentFaq = faqs[idx]
  const swapFaq = faqs[swapIdx]

  await admin.from('faqs').update({ sort_order: swapFaq.sort_order }).eq('id', currentFaq.id)
  await admin.from('faqs').update({ sort_order: currentFaq.sort_order }).eq('id', swapFaq.id)

  revalidatePath('/admin/faqs')
  revalidatePath('/faq')
  return { success: true }
}
