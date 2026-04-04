'use client'

import { useActionState } from 'react'
import { assignVoicePart, type RusheeActionState } from '@/actions/rushees'
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
  const [state, action, pending] = useActionState<RusheeActionState, FormData>(
    assignVoicePart,
    undefined
  )

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
        <form action={action} className="flex items-center gap-2">
          <input type="hidden" name="rusheeId" value={rushee.id} />
          <Select name="voicePart" defaultValue={rushee.voice_part ?? undefined}>
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
          <Button size="sm" type="submit" disabled={pending}>
            {pending ? '…' : 'Save'}
          </Button>
          {state?.error ? <span className="text-xs text-red-500">{state.error}</span> : null}
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
