'use client'

import { useActionState } from 'react'
import { deleteMaterial, uploadMaterial, type MaterialActionState } from '@/actions/materials'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VOICE_PARTS } from '@/lib/voice-parts'

type Material = {
  id: string
  title: string
  voice_part: string
  file_type: string
  file_name: string
}

function DeleteMaterialButton({ materialId }: { materialId: string }) {
  const [state, action, pending] = useActionState<MaterialActionState, FormData>(
    async (_prev, _formData) => deleteMaterial(materialId),
    undefined
  )

  return (
    <form action={action}>
      <Button size="sm" variant="destructive" type="submit" disabled={pending}>
        {pending ? '...' : 'Delete'}
      </Button>
      {state?.error ? <span className="ml-2 text-xs text-red-500">{state.error}</span> : null}
    </form>
  )
}

export function MaterialUploadForm({ materials }: { materials: Material[] }) {
  const [state, action, pending] = useActionState<MaterialActionState, FormData>(
    uploadMaterial,
    undefined
  )

  return (
    <div className="max-w-2xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl tracking-wide leading-none">Upload Material</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4" encType="multipart/form-data">
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="voicePart">Voice Part</Label>
              <Select name="voicePart">
                <SelectTrigger id="voicePart" className="w-full">
                  <SelectValue placeholder="Select voice part" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_PARTS.map((part) => (
                    <SelectItem key={part} value={part}>
                      {part}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="file">File (PDF ≤ 20MB or audio ≤ 50MB)</Label>
              <Input
                id="file"
                name="file"
                type="file"
                accept=".pdf,.mp3,.m4a,.wav,application/pdf,audio/mpeg,audio/mp4,audio/wav"
                required
              />
            </div>
            {state?.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
            <Button type="submit" disabled={pending}>
              {pending ? 'Uploading...' : 'Upload'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 font-display text-2xl tracking-wide leading-none">Uploaded Materials</h2>
        {materials.length === 0 ? (
          <p className="text-muted-foreground">No materials yet.</p>
        ) : (
          <div className="space-y-2">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{material.title}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline">{material.voice_part}</Badge>
                    <Badge variant="secondary">{material.file_type.toUpperCase()}</Badge>
                    <span className="text-xs text-muted-foreground">{material.file_name}</span>
                  </div>
                </div>
                <DeleteMaterialButton materialId={material.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
