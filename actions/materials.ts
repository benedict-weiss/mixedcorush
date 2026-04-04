'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const storagePathSchema = z.string().min(1).max(500)

export async function getSignedUrl(
  storagePath: string
): Promise<{ url?: string; error?: string }> {
  if (!storagePathSchema.safeParse(storagePath).success) {
    return { error: 'Invalid path.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.storage.from('materials').createSignedUrl(storagePath, 3600)

  if (error || !data?.signedUrl) {
    return { error: 'Could not access this file.' }
  }

  return { url: data.signedUrl }
}

export async function uploadMaterial(
  _formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  return { error: 'Not implemented' }
}

export async function deleteMaterial(
  _id: string
): Promise<{ error?: string; success?: boolean }> {
  return { error: 'Not implemented' }
}
