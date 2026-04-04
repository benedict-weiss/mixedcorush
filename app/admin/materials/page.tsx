import { MaterialUploadForm } from '@/components/MaterialUploadForm'
import { createAdminClient } from '@/lib/supabase/admin'

type Material = {
  id: string
  title: string
  voice_part: string
  file_type: string
  file_name: string
}

export default async function AdminMaterialsPage() {
  const admin = createAdminClient()

  const { data: materials } = await admin
    .from('audition_materials')
    .select('id, title, voice_part, file_type, file_name')
    .order('uploaded_at', { ascending: false })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Manage Materials</h1>
      <MaterialUploadForm materials={(materials as Material[] | null) ?? []} />
    </div>
  )
}
