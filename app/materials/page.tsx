import Link from 'next/link'
import { getSignedUrl } from '@/actions/materials'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

type Material = {
  id: string
  title: string
  voice_part: string
  file_type: string
  file_name: string
  storage_path: string
}

export default async function MaterialsPage() {
  await getAuthenticatedUser()
  const supabase = await createClient()

  const { data: materials } = await supabase
    .from('audition_materials')
    .select('id, title, voice_part, file_type, file_name, storage_path')
    .order('voice_part', { ascending: true })

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Audition Materials</h1>
        <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          ← Dashboard
        </Link>
      </div>

      {!materials || materials.length === 0 ? (
        <p className="text-muted-foreground">No materials have been uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {materials.map((material) => (
            <MaterialRow
              key={material.id}
              title={material.title}
              voicePart={material.voice_part}
              fileType={material.file_type}
              storagePath={material.storage_path}
            />
          ))}
        </div>
      )}
    </main>
  )
}

async function MaterialRow({
  title,
  voicePart,
  fileType,
  storagePath,
}: {
  title: string
  voicePart: string
  fileType: string
  storagePath: string
}) {
  const { url } = await getSignedUrl(storagePath)

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border">
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <div className="flex gap-2">
          <Badge variant="outline">{voicePart}</Badge>
          <Badge variant="secondary">{fileType.toUpperCase()}</Badge>
        </div>
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: 'sm' })}
        >
          Open
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">Unavailable</span>
      )}
    </div>
  )
}
