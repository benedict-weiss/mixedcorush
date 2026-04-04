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
    <div className="space-y-10">
      {blocks.map((block) => (
        <div key={block.id}>
          <h2 className="font-display text-2xl tracking-wide leading-none mb-4">
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
                  className={`relative flex items-center justify-between border p-3 overflow-hidden transition-opacity ${
                    isMine
                      ? 'border-primary/40 bg-primary/5'
                      : isTaken
                        ? 'border-border opacity-40'
                        : 'border-border hover:border-border/60'
                  }`}
                >
                  {isMine && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" aria-hidden="true" />
                  )}
                  <div className="flex items-center gap-3 pl-1">
                    <span className="text-sm tabular-nums">
                      {new Date(slot.start_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' – '}
                      {new Date(slot.end_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMine ? (
                      <Badge variant="default" className="text-xs tracking-widest uppercase">
                        Your slot
                      </Badge>
                    ) : null}
                    {isTaken ? (
                      <Badge variant="secondary" className="text-xs tracking-widest uppercase">
                        Taken
                      </Badge>
                    ) : null}
                  </div>

                  <div>
                    {isMine ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRelease}
                        disabled={isPending}
                      >
                        Release
                      </Button>
                    ) : null}
                    {isAvailable ? (
                      <Button
                        size="sm"
                        onClick={() => handleClaim(slot.id)}
                        disabled={isPending}
                      >
                        {mySlotId ? 'Switch' : 'Select'}
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
