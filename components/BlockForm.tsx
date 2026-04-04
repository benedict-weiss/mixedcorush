'use client'

import { useActionState } from 'react'
import { createBlock, deleteBlock, type BlockActionState } from '@/actions/blocks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Block = {
  id: string
  date: string
  start_time: string
  end_time: string
  slot_duration: number
  total: number
  claimed: number
}

function DeleteBlockButton({ blockId }: { blockId: string }) {
  const [state, action, pending] = useActionState<BlockActionState, FormData>(
    async (_prev, _formData) => deleteBlock(blockId),
    undefined
  )

  return (
    <form action={action}>
      <Button size="sm" variant="destructive" type="submit" disabled={pending}>
        {pending ? 'Deleting...' : 'Delete'}
      </Button>
      {state?.error ? <span className="ml-2 text-xs text-red-500">{state.error}</span> : null}
    </form>
  )
}

export function BlockForm({ blocks }: { blocks: Block[] }) {
  const [state, action, pending] = useActionState<BlockActionState, FormData>(
    createBlock,
    undefined
  )

  return (
    <div className="max-w-2xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Audition Block</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
                <Input
                  id="slotDuration"
                  name="slotDuration"
                  type="number"
                  defaultValue="15"
                  min={5}
                  max={120}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" name="startTime" type="time" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" name="endTime" type="time" required />
              </div>
            </div>

            {state?.error ? <p className="text-sm text-red-500">{state.error}</p> : null}

            <Button type="submit" disabled={pending}>
              {pending ? 'Creating...' : 'Create Block'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Existing Blocks</h2>
        {blocks.length === 0 ? (
          <p className="text-muted-foreground">No blocks yet.</p>
        ) : (
          <div className="space-y-3">
            {blocks.map((block) => (
              <div key={block.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">
                    {new Date(`${block.date}T00:00:00`).toLocaleDateString([], {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {block.start_time} - {block.end_time} · {block.slot_duration}min slots ·{' '}
                    {block.claimed}/{block.total} claimed
                  </p>
                </div>
                <DeleteBlockButton blockId={block.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
