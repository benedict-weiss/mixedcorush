import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

import { claimSlot, releaseSlot } from '@/actions/slots'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const mockCreateClient = vi.mocked(createClient)
const mockCreateAdminClient = vi.mocked(createAdminClient)

const SLOT_ID = '11111111-1111-4111-8111-111111111111'

function makeUserClientMock({
  userId,
  rpcError,
}: {
  userId: string | null
  rpcError?: string | null
}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userId ? { id: userId } : null },
        error: userId ? null : { message: 'Not authenticated' },
      }),
    },
    rpc: vi.fn().mockResolvedValue({
      error: rpcError ? { message: rpcError } : null,
    }),
  }
}

function makeAdminMock() {
  return {
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  }
}

describe('claimSlot', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns error for invalid slot id', async () => {
    const result = await claimSlot('not-a-uuid')
    expect(result).toEqual({ error: 'Invalid slot.' })
  })

  it('returns error when not authenticated', async () => {
    mockCreateClient.mockResolvedValue(
      makeUserClientMock({ userId: null, rpcError: null }) as never
    )
    const result = await claimSlot(SLOT_ID)
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when slot is unavailable', async () => {
    mockCreateClient.mockResolvedValue(
      makeUserClientMock({ userId: 'user-1', rpcError: 'slot_unavailable' }) as never
    )
    const result = await claimSlot(SLOT_ID)
    expect(result).toEqual({ error: 'This slot is no longer available.' })
  })

  it('returns success when slot is claimed', async () => {
    mockCreateClient.mockResolvedValue(
      makeUserClientMock({ userId: 'user-1', rpcError: null }) as never
    )
    const result = await claimSlot(SLOT_ID)
    expect(result).toEqual({ success: true })
  })
})

describe('releaseSlot', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns error when not authenticated', async () => {
    mockCreateClient.mockResolvedValue(
      makeUserClientMock({ userId: null, rpcError: null }) as never
    )
    const result = await releaseSlot()
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns success when slot is released', async () => {
    mockCreateClient.mockResolvedValue(
      makeUserClientMock({ userId: 'user-1', rpcError: null }) as never
    )
    mockCreateAdminClient.mockReturnValue(makeAdminMock() as never)
    const result = await releaseSlot()
    expect(result).toEqual({ success: true })
  })
})
