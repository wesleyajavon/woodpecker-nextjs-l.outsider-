import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from './route'

vi.mock('@/services/beatService', () => ({
  BeatService: {
    activateScheduledBeats: vi.fn(),
  },
}))

const { BeatService } = await import('@/services/beatService')

function createRequest(overrides: { headers?: Headers } = {}) {
  const headers = new Headers(overrides.headers)
  return new Request('http://localhost/api/cron/activate-scheduled-beats', {
    method: 'GET',
    headers,
  })
}

describe('Cron: activate-scheduled-beats', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv, CRON_SECRET: 'test-cron-secret-16chars' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns 401 when CRON_SECRET is missing', async () => {
    delete process.env.CRON_SECRET

    const request = createRequest({
      headers: { Authorization: 'Bearer test-cron-secret-16chars' },
    })

    const response = await GET(request as unknown as import('next/server').NextRequest)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized' })
  })

  it('returns 401 when Authorization header is missing', async () => {
    const request = createRequest()

    const response = await GET(request as unknown as import('next/server').NextRequest)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized' })
  })

  it('returns 401 when Authorization header does not match CRON_SECRET', async () => {
    const request = createRequest({
      headers: { Authorization: 'Bearer wrong-secret' },
    })

    const response = await GET(request as unknown as import('next/server').NextRequest)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized' })
  })

  it('calls BeatService.activateScheduledBeats and returns activated count', async () => {
    vi.mocked(BeatService.activateScheduledBeats).mockResolvedValue(3)

    const request = createRequest({
      headers: { Authorization: 'Bearer test-cron-secret-16chars' },
    })

    const response = await GET(request as unknown as import('next/server').NextRequest)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      success: true,
      activatedCount: 3,
      message: '3 beat(s) activé(s)',
    })
    expect(BeatService.activateScheduledBeats).toHaveBeenCalledOnce()
  })

  it('returns 500 when BeatService throws', async () => {
    vi.mocked(BeatService.activateScheduledBeats).mockRejectedValue(
      new Error('DB error')
    )

    const request = createRequest({
      headers: { Authorization: 'Bearer test-cron-secret-16chars' },
    })

    const response = await GET(request as unknown as import('next/server').NextRequest)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      error: "Erreur lors de l'activation des beats planifiés",
    })
  })
})
