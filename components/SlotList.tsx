'use client'

import { useTransition } from 'react'
import { claimSlot, releaseSlot } from '@/actions/slots'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Slot = {
  id: string
  start_time: string
  end_time: string
  rushee_id: string | null
}

type Block = {
  id: string
  date: string
  slots: Slot[]
}

export function SlotList({
  blocks,
  mySlotId,
}: {
  blocks: Block[]
  mySlotId: string | null
}) {
  const [isPending, startTransition] = useTransition()

  function handleClaim(slotId: string) {
    startTransition(async () => {
      await claimSlot(slotId)
    })
  }

  function handleRelease() {
    startTransition(async () => {
      await releaseSlot()
    })
  }

  if (blocks.length === 0) {
    return <p className="text-muted-foreground">No audition slots have been scheduled yet.</p>
  }

  return (
    <div className="space-y-8">
      {blocks.map((block) => (
        <div key={block.id}>
          <h2 className="text-lg font-semibold mb-3">
            {new Date(`${block.date}T00:00:00`).toLocaleDateString([], {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h2>
          <div className="space-y-2">
            {block.slots.map((slot) => {
              const isMine = slot.id === mySlotId
              const isTaken = slot.rushee_id !== null && !isMine
              const isAvailable = slot.rushee_id === null

              return (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    isMine
                      ? 'border-primary bg-primary/5'
                      : isTaken
                        ? 'border-border bg-muted opacity-50'
                        : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">
                      {new Date(slot.start_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' - '}
                      {new Date(slot.end_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMine ? <Badge variant="default">Your slot</Badge> : null}
                    {isTaken ? <Badge variant="secondary">Taken</Badge> : null}
                  </div>

                  <div>
                    {isMine ? (
                      <Button size="sm" variant="outline" onClick={handleRelease} disabled={isPending}>
                        Release
                      </Button>
                    ) : null}
                    {isAvailable ? (
                      <Button size="sm" onClick={() => handleClaim(slot.id)} disabled={isPending}>
                        {mySlotId ? 'Switch to this slot' : 'Claim'}
                      </Button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
