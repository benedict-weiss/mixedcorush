import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, requireAdmin } from '@/lib/auth'

const mockRedirect = vi.mocked(redirect)
const mockCreateClient = vi.mocked(createClient)

function makeSupabaseMock(user: { id: string } | null, profile: object | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'Not authenticated' },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: profile, error: null }),
        }),
      }),
    }),
  }
}

describe('getAuthenticatedUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to /login when not authenticated', async () => {
    mockCreateClient.mockResolvedValue(makeSupabaseMock(null, null) as never)
    await getAuthenticatedUser()
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('redirects to /login when profile is missing', async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseMock({ id: 'user-1' }, null) as never
    )
    await getAuthenticatedUser()
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('returns the user profile when authenticated', async () => {
    const profile = { id: 'user-1', role: 'RUSHEE', name: 'Alice' }
    mockCreateClient.mockResolvedValue(
      makeSupabaseMock({ id: 'user-1' }, profile) as never
    )
    const result = await getAuthenticatedUser()
    expect(result).toEqual(profile)
  })
})

describe('requireAdmin', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to /dashboard when user is not ADMIN', async () => {
    const profile = { id: 'user-1', role: 'RUSHEE', name: 'Alice' }
    mockCreateClient.mockResolvedValue(
      makeSupabaseMock({ id: 'user-1' }, profile) as never
    )
    await requireAdmin()
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('returns the profile when user is ADMIN', async () => {
    const profile = { id: 'user-1', role: 'ADMIN', name: 'Bob' }
    mockCreateClient.mockResolvedValue(
      makeSupabaseMock({ id: 'user-1' }, profile) as never
    )
    const result = await requireAdmin()
    expect(result).toEqual(profile)
  })
})
