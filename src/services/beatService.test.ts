import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BeatService } from './beatService'
import { mockPrisma, createMockBeat } from '@/test/setup'

const baseCreateInput = {
  title: 'Test Beat',
  description: 'Test',
  genre: 'Trap',
  bpm: 140,
  key: 'C#',
  mode: 'mineur',
  duration: '3:24',
  wavLeasePrice: 19.99,
  trackoutLeasePrice: 39.99,
  unlimitedLeasePrice: 79.99,
  tags: ['Test'],
}

describe('BeatService - Scheduled Release', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createBeat - scheduledReleaseAt visibility', () => {
    it('1. scheduledReleaseAt in the future → beat is created with isActive=false', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // +24h
      const mockBeat = createMockBeat({
        isActive: false,
        scheduledReleaseAt: futureDate,
      })

      mockPrisma.beat.create.mockResolvedValue(mockBeat)

      const result = await BeatService.createBeat({
        ...baseCreateInput,
        scheduledReleaseAt: futureDate,
      })

      expect(mockPrisma.beat.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isActive: false,
            scheduledReleaseAt: futureDate,
          }),
        })
      )
      expect(result.isActive).toBe(false)
      expect(result.scheduledReleaseAt).toEqual(futureDate)
    })

    it('2. scheduledReleaseAt in the past → beat is created with isActive=true (visible immediately)', async () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000) // -1h
      const mockBeat = createMockBeat({
        isActive: true,
        scheduledReleaseAt: pastDate,
      })

      mockPrisma.beat.create.mockResolvedValue(mockBeat)

      const result = await BeatService.createBeat({
        ...baseCreateInput,
        scheduledReleaseAt: pastDate,
      })

      expect(mockPrisma.beat.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isActive: true,
            scheduledReleaseAt: pastDate,
          }),
        })
      )
      expect(result.isActive).toBe(true)
    })

    it('2. scheduledReleaseAt null → beat is created with isActive=true (visible immediately)', async () => {
      const mockBeat = createMockBeat({
        isActive: true,
        scheduledReleaseAt: null,
      })

      mockPrisma.beat.create.mockResolvedValue(mockBeat)

      const result = await BeatService.createBeat({
        ...baseCreateInput,
      })

      expect(mockPrisma.beat.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isActive: true,
            scheduledReleaseAt: null,
          }),
        })
      )
      expect(result.isActive).toBe(true)
    })

    it('stores dates in UTC (scheduledReleaseAt passed as Date object)', async () => {
      const utcDate = new Date('2025-02-15T14:00:00.000Z')
      const mockBeat = createMockBeat({
        isActive: false,
        scheduledReleaseAt: utcDate,
      })

      mockPrisma.beat.create.mockResolvedValue(mockBeat)

      await BeatService.createBeat({
        ...baseCreateInput,
        scheduledReleaseAt: utcDate,
      })

      expect(mockPrisma.beat.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            scheduledReleaseAt: utcDate,
          }),
        })
      )
    })

    it('handles invalid date string by treating as null (NaN > now is false)', async () => {
      // Invalid date: new Date('invalid') gives NaN, comparison with now is false
      const invalidDate = new Date('invalid')
      const mockBeat = createMockBeat({ isActive: true, scheduledReleaseAt: invalidDate })

      mockPrisma.beat.create.mockResolvedValue(mockBeat)

      await BeatService.createBeat({
        ...baseCreateInput,
        scheduledReleaseAt: invalidDate as unknown as Date,
      })

      // isScheduledForFuture = invalidDate > now → NaN > now = false, so isActive = true
      expect(mockPrisma.beat.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isActive: true,
          }),
        })
      )
    })
  })

  describe('getBeats - visibility filter', () => {
    it('excludes beats with scheduledReleaseAt in the future from public results', async () => {
      const visibleBeat = createMockBeat({
        isActive: true,
        scheduledReleaseAt: null,
      })

      mockPrisma.beat.count.mockResolvedValue(1)
      mockPrisma.beat.findMany.mockResolvedValue([visibleBeat])

      const { beats } = await BeatService.getBeats(
        {},
        { field: 'createdAt', order: 'desc' },
        1,
        12,
        undefined,
        false,
        false
      )

      expect(mockPrisma.beat.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: [
                  { scheduledReleaseAt: null },
                  { scheduledReleaseAt: { lte: expect.any(Date) } },
                ],
              }),
            ]),
          }),
        })
      )
      expect(beats).toHaveLength(1)
    })

    it('4. Admin with includeInactive sees scheduled beats before they go live', async () => {
      const scheduledBeat = createMockBeat({
        isActive: false,
        scheduledReleaseAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })

      mockPrisma.beat.count.mockResolvedValue(1)
      mockPrisma.beat.findMany.mockResolvedValue([scheduledBeat])

      const { beats } = await BeatService.getBeats(
        {},
        { field: 'createdAt', order: 'desc' },
        1,
        12,
        undefined,
        true,
        true // includeInactive
      )

      expect(mockPrisma.beat.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            isActive: true,
          }),
        })
      )
      expect(beats).toHaveLength(1)
      expect(beats[0].isActive).toBe(false)
    })
  })

  describe('getBeatById - visibility filter', () => {
    it('returns null for beat with scheduledReleaseAt in the future (public)', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const scheduledBeat = createMockBeat({
        isActive: false,
        scheduledReleaseAt: futureDate,
      })

      mockPrisma.beat.findUnique.mockResolvedValue(scheduledBeat)

      const result = await BeatService.getBeatById(
        'beat-1',
        undefined,
        false,
        false
      )

      expect(result).toBeNull()
    })

    it('returns beat with scheduledReleaseAt in the past (public)', async () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000)
      const visibleBeat = createMockBeat({
        isActive: true,
        scheduledReleaseAt: pastDate,
      })

      mockPrisma.beat.findUnique.mockResolvedValue(visibleBeat)

      const result = await BeatService.getBeatById(
        'beat-1',
        undefined,
        false,
        false
      )

      expect(result).not.toBeNull()
      expect(result?.id).toBe('beat-1')
    })

    it('admin with includeInactive sees scheduled beat', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const scheduledBeat = createMockBeat({
        isActive: false,
        scheduledReleaseAt: futureDate,
      })

      mockPrisma.beat.findUnique.mockResolvedValue(scheduledBeat)

      const result = await BeatService.getBeatById(
        'beat-1',
        'user-1',
        true,
        true
      )

      expect(result).not.toBeNull()
      expect(result?.scheduledReleaseAt).toEqual(futureDate)
    })
  })

  describe('activateScheduledBeats (cron)', () => {
    it('3. activates beats when scheduledReleaseAt <= now', async () => {
      mockPrisma.beat.updateMany.mockResolvedValue({ count: 2 })

      const count = await BeatService.activateScheduledBeats()

      expect(mockPrisma.beat.updateMany).toHaveBeenCalledWith({
        where: {
          scheduledReleaseAt: { not: null, lte: expect.any(Date) },
          isActive: false,
        },
        data: { isActive: true },
      })
      expect(count).toBe(2)
    })

    it('is idempotent: WHERE isActive=false ensures already-activated beats are not re-processed', async () => {
      mockPrisma.beat.updateMany.mockResolvedValue({ count: 2 })

      const count = await BeatService.activateScheduledBeats()

      // Idempotency: we only update beats where isActive=false. After activation,
      // those beats have isActive=true, so they won't match on the next cron run.
      expect(mockPrisma.beat.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: false,
          }),
        })
      )
      expect(count).toBe(2)
    })
  })

  describe('updateBeat - scheduledReleaseAt', () => {
    it('updating scheduledReleaseAt to future sets isActive=false', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const updatedBeat = createMockBeat({
        isActive: false,
        scheduledReleaseAt: futureDate,
      })

      mockPrisma.beat.findUnique.mockResolvedValue({ userId: 'user-1' })
      mockPrisma.beat.update.mockResolvedValue(updatedBeat)

      const result = await BeatService.updateBeat(
        'beat-1',
        { scheduledReleaseAt: futureDate },
        'user-1'
      )

      expect(mockPrisma.beat.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isActive: false,
            scheduledReleaseAt: futureDate,
          }),
        })
      )
      expect(result.isActive).toBe(false)
    })

    it('clearing scheduledReleaseAt sets isActive=true', async () => {
      const updatedBeat = createMockBeat({
        isActive: true,
        scheduledReleaseAt: null,
      })

      mockPrisma.beat.findUnique.mockResolvedValue({ userId: 'user-1' })
      mockPrisma.beat.update.mockResolvedValue(updatedBeat)

      await BeatService.updateBeat('beat-1', { scheduledReleaseAt: null }, 'user-1')

      expect(mockPrisma.beat.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isActive: true,
            scheduledReleaseAt: null,
          }),
        })
      )
    })
  })
})
