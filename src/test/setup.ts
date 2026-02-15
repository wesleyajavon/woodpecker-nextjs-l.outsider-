import { vi } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'

// Suppress console output during tests
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

// Mock Prisma client
const mockPrisma = {
  beat: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn(),
  },
}

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock Stripe - avoid API calls during tests
vi.mock('@/lib/stripe', () => ({
  createBeatStripeProducts: vi.fn().mockResolvedValue(null),
}))

// Helper to create a mock beat with Decimal prices
export function createMockBeat(overrides: Record<string, unknown> = {}) {
  const now = new Date()
  return {
    id: 'beat-1',
    title: 'Test Beat',
    description: 'Test',
    genre: 'Trap',
    bpm: 140,
    key: 'C#',
    mode: 'mineur',
    duration: '3:24',
    wavLeasePrice: new Decimal(19.99),
    trackoutLeasePrice: new Decimal(39.99),
    unlimitedLeasePrice: new Decimal(79.99),
    rating: 0,
    reviewCount: 0,
    tags: ['Test'],
    isExclusive: false,
    isActive: true,
    featured: false,
    scheduledReleaseAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export { mockPrisma }
