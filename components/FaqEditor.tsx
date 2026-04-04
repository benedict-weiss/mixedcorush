'use client'

import { useActionState, useState } from 'react'
import { createFaq, deleteFaq, moveFaq, updateFaq, type FaqActionState } from '@/actions/faqs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Faq = { id: string; question: string; answer: string; sort_order: number }

function FaqRow({ faq, isFirst, isLast }: { faq: Faq; isFirst: boolean; isLast: boolean }) {
  const [editing, setEditing] = useState(false)
  const [editState, editAction, editPending] = useActionState<FaqActionState, FormData>(
    updateFaq,
    undefined
  )

  const moveUpAction = async () => {
    await moveFaq(faq.id, 'up')
  }
  const moveDownAction = async () => {
    await moveFaq(faq.id, 'down')
  }
  const deleteAction = async () => {
    await deleteFaq(faq.id)
  }

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        {editing ? (
          <form action={editAction} className="flex-1 space-y-3">
            <input type="hidden" name="id" value={faq.id} />
            <div className="space-y-1">
              <Label>Question</Label>
              <Input name="question" defaultValue={faq.question} required />
            </div>
            <div className="space-y-1">
              <Label>Answer</Label>
              <Textarea name="answer" defaultValue={faq.answer} rows={3} required />
            </div>
            {editState?.error ? <p className="text-sm text-red-500">{editState.error}</p> : null}
            <div className="flex gap-2">
              <Button size="sm" type="submit" disabled={editPending}>
                {editPending ? 'Saving...' : 'Save'}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex-1">
            <p className="font-medium">{faq.question}</p>
            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{faq.answer}</p>
          </div>
        )}

        {!editing ? (
          <div className="shrink-0 flex items-center gap-1">
            <form action={moveUpAction}>
              <Button size="sm" variant="ghost" type="submit" disabled={isFirst}>
                ↑
              </Button>
            </form>
            <form action={moveDownAction}>
              <Button size="sm" variant="ghost" type="submit" disabled={isLast}>
                ↓
              </Button>
            </form>
            <Button size="sm" variant="outline" type="button" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <form action={deleteAction}>
              <Button size="sm" variant="destructive" type="submit">
                Delete
              </Button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function FaqEditor({ faqs }: { faqs: Faq[] }) {
  const [createState, createAction, createPending] = useActionState<FaqActionState, FormData>(
    createFaq,
    undefined
  )

  return (
    <div className="max-w-2xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add FAQ</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="question">Question</Label>
              <Input id="question" name="question" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="answer">Answer</Label>
              <Textarea id="answer" name="answer" rows={3} required />
            </div>
            {createState?.error ? <p className="text-sm text-red-500">{createState.error}</p> : null}
            <Button type="submit" disabled={createPending}>
              {createPending ? 'Adding...' : 'Add FAQ'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold">FAQs</h2>
        {faqs.length === 0 ? (
          <p className="text-muted-foreground">No FAQs yet.</p>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <FaqRow key={faq.id} faq={faq} isFirst={idx === 0} isLast={idx === faqs.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
