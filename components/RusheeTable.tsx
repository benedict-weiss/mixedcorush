'use client'

import { useActionState, useRef } from 'react'
import { assignVoicePart, deleteRushee, type RusheeActionState } from '@/actions/rushees'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { VOICE_PARTS } from '@/lib/voice-parts'

type Rushee = {
  id: string
  name: string
  email: string
  voice_part: string | null
  audition_slots: { start_time: string } | null
}

function RusheeRow({ rushee }: { rushee: Rushee }) {
  const [assignState, assignAction, assignPending] = useActionState<RusheeActionState, FormData>(
    assignVoicePart,
    undefined
  )
  const [deleteState, deleteAction, deletePending] = useActionState<RusheeActionState, FormData>(
    async (_prev: RusheeActionState, _formData: FormData) => deleteRushee(rushee.id),
    undefined
  )
  const formRef = useRef<HTMLFormElement>(null)
  const anyPending = assignPending || deletePending

  return (
    <TableRow>
      <TableCell>{rushee.name}</TableCell>
      <TableCell className="text-muted-foreground text-sm">{rushee.email}</TableCell>
      <TableCell>
        {rushee.audition_slots ? (
          <span className="text-sm">
            {new Date(rushee.audition_slots.start_time).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">Unscheduled</span>
        )}
      </TableCell>
      <TableCell>
        <form ref={formRef} action={assignAction} className="flex items-center gap-2">
          <input type="hidden" name="rusheeId" value={rushee.id} />
          <Select
            key={rushee.voice_part ?? ''}
            name="voicePart"
            defaultValue={rushee.voice_part ?? undefined}
            onValueChange={() => setTimeout(() => formRef.current?.requestSubmit(), 0)}
            disabled={anyPending}
          >
            <SelectTrigger size="sm" className="w-32">
              <SelectValue placeholder="Assign…" />
            </SelectTrigger>
            <SelectContent>
              {VOICE_PARTS.map((part) => (
                <SelectItem key={part} value={part}>
                  {part}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {assignState?.error ? (
            <span className="text-xs text-red-500">{assignState.error}</span>
          ) : null}
        </form>
      </TableCell>
      <TableCell>
        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (!confirm(`Delete ${rushee.name}? This cannot be undone.`)) {
              e.preventDefault()
            }
          }}
        >
          <Button size="sm" variant="destructive" type="submit" disabled={anyPending}>
            {deletePending ? 'Deleting…' : 'Delete'}
          </Button>
          {deleteState?.error ? (
            <span className="text-xs text-red-500 ml-2">{deleteState.error}</span>
          ) : null}
        </form>
      </TableCell>
    </TableRow>
  )
}

export function RusheeTable({ rushees }: { rushees: Rushee[] }) {
  if (rushees.length === 0) {
    return <p className="text-muted-foreground">No rushees yet.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="text-left text-muted-foreground">
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Slot</TableHead>
          <TableHead>Voice Part</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rushees.map((rushee) => (
          <RusheeRow key={rushee.id} rushee={rushee} />
        ))}
      </TableBody>
    </Table>
  )
}
