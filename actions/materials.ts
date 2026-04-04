'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getFileType, validateMaterialFile } from '@/lib/validateMaterialFile'
import { VOICE_PARTS } from '@/lib/voice-parts'

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

export type MaterialActionState = { error?: string; success?: boolean } | undefined

export async function uploadMaterial(
  _prev: MaterialActionState,
  formData: FormData
): Promise<MaterialActionState> {
  await requireAdmin()

  const title = formData.get('title')
  const voicePart = formData.get('voicePart')
  const file = formData.get('file')

  if (typeof title !== 'string' || title.trim().length === 0) {
    return { error: 'Title is required.' }
  }
  if (!VOICE_PARTS.includes(voicePart as (typeof VOICE_PARTS)[number])) {
    return { error: 'Invalid voice part.' }
  }
  if (!(file instanceof File)) {
    return { error: 'File is required.' }
  }

  const validationError = validateMaterialFile(file.name, file.type, file.size)
  if (validationError) {
    return { error: validationError }
  }

  const fileType = getFileType(file.type)
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const storagePath = `${voicePart.trim()}/${crypto.randomUUID()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const admin = createAdminClient()

  const { error: uploadError } = await admin.storage
    .from('materials')
    .upload(storagePath, arrayBuffer, { contentType: file.type })

  if (uploadError) {
    return { error: 'Upload failed. Please try again.' }
  }

  const { error: dbError } = await admin.from('audition_materials').insert({
    title: title.trim(),
    voice_part: voicePart.trim(),
    file_type: fileType,
    file_name: file.name,
    storage_path: storagePath,
  })

  if (dbError) {
    await admin.storage.from('materials').remove([storagePath])
    return { error: 'Failed to save material record.' }
  }

  revalidatePath('/admin/materials')
  revalidatePath('/materials')
  return { success: true }
}

export async function deleteMaterial(materialId: string): Promise<MaterialActionState> {
  await requireAdmin()

  if (!z.string().uuid().safeParse(materialId).success) {
    return { error: 'Invalid material ID.' }
  }

  const admin = createAdminClient()
  const { data: material } = await admin
    .from('audition_materials')
    .select('storage_path')
    .eq('id', materialId)
    .single()

  if (!material) {
    return { error: 'Material not found.' }
  }

  await admin.storage.from('materials').remove([material.storage_path])

  const { error } = await admin.from('audition_materials').delete().eq('id', materialId)

  if (error) {
    return { error: 'Failed to delete material.' }
  }

  revalidatePath('/admin/materials')
  revalidatePath('/materials')
  return { success: true }
}
