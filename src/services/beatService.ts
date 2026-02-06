import { prisma } from '@/lib/prisma'
import { Beat, CreateBeatInput, UpdateBeatInput, BeatFilters, BeatSortOptions } from '@/types/beat'
// Import Decimal from Prisma
import { Decimal } from '@prisma/client/runtime/library'
import { createBeatStripeProducts } from '@/lib/stripe'

// Type for Prisma Beat result with Decimal prices
type PrismaBeatResult = Omit<Beat, 'wavLeasePrice' | 'trackoutLeasePrice' | 'unlimitedLeasePrice'> & {
  wavLeasePrice: Decimal
  trackoutLeasePrice: Decimal
  unlimitedLeasePrice: Decimal
}

// Type for the where clause in Prisma queries
type BeatWhereClause = {
  isActive?: boolean
  genre?: string
  bpm?: {
    gte?: number
    lte?: number
  }
  key?: string
  wavLeasePrice?: {
    gte?: Decimal
    lte?: Decimal
  }
  isExclusive?: boolean
  featured?: boolean
  userId?: string
  AND?: Array<Record<string, unknown>>
  OR?: Array<{
    title?: { contains: string; mode: 'insensitive' }
    description?: { contains: string; mode: 'insensitive' }
    tags?: { hasSome: string[] }
  }>
}

export class BeatService {
  // Fonction utilitaire pour convertir les résultats Prisma
  private static convertPrismaBeat(beat: PrismaBeatResult): Beat {
    return {
      ...beat,
      wavLeasePrice: Number(beat.wavLeasePrice),
      trackoutLeasePrice: Number(beat.trackoutLeasePrice),
      unlimitedLeasePrice: Number(beat.unlimitedLeasePrice)
    }
  }

  // Créer un nouveau beat
  static async createBeat(data: CreateBeatInput, userId?: string): Promise<Beat> {
    const beat = await prisma.beat.create({
      data: {
        ...data,
        wavLeasePrice: new Decimal(data.wavLeasePrice),
        trackoutLeasePrice: new Decimal(data.trackoutLeasePrice),
        unlimitedLeasePrice: new Decimal(data.unlimitedLeasePrice),
        userId
      }
    })
    
    const convertedBeat = this.convertPrismaBeat(beat as PrismaBeatResult)
    
    // Automatically create Stripe product for the new beat
    try {
      console.log(`🔄 Creating Stripe product for new beat: ${beat.title}`)
      const stripeResult = await createBeatStripeProducts({
        id: convertedBeat.id,
        title: convertedBeat.title,
        description: convertedBeat.description || null,
        wavLeasePrice: convertedBeat.wavLeasePrice,
        trackoutLeasePrice: convertedBeat.trackoutLeasePrice,
        unlimitedLeasePrice: convertedBeat.unlimitedLeasePrice
      })
      
      if (stripeResult) {
        // Update the beat with the Stripe price IDs
        const updatedBeat = await prisma.beat.update({
          where: { id: beat.id },
          data: { 
            stripeWavPriceId: stripeResult.prices.wav,
            stripeTrackoutPriceId: stripeResult.prices.trackout,
            stripeUnlimitedPriceId: stripeResult.prices.unlimited
          }
        })
        
        console.log(`✅ Stripe products created and linked to beat: ${beat.title}`)
        return this.convertPrismaBeat(updatedBeat as PrismaBeatResult)
      } else {
        console.warn(`⚠️  Failed to create Stripe product for beat: ${beat.title}`)
        // Return the beat without Stripe integration - it can be created later
        return convertedBeat
      }
    } catch (error) {
      console.error(`❌ Error creating Stripe product for beat: ${beat.title}`, error)
      // Return the beat without Stripe integration - it can be created later
      return convertedBeat
    }
  }
    

  // Get all beats with optional filters and sorting
  static async getBeats(
    filters: BeatFilters = {},
    sort: BeatSortOptions = { field: 'createdAt', order: 'desc' },
    page: number = 1,
    limit: number = 12,
    userId?: string,
    isAdmin: boolean = false,
    includeInactive: boolean = false
  ): Promise<{ beats: Beat[]; total: number; totalPages: number }> {
    const where: BeatWhereClause = {}
    
    // Only filter by isActive if not including inactive beats
    if (!includeInactive) {
      where.isActive = true
    }

    // Filter by user only if provided AND user is admin
    // Regular users and non-authenticated users see all beats
    if (userId && isAdmin) {
      where.userId = userId
    }

    // Apply filters
    if (filters.genre && filters.genre !== 'Tous') {
      where.genre = filters.genre
    }

    if (filters.bpmMin || filters.bpmMax) {
      where.bpm = {}
      if (filters.bpmMin) where.bpm.gte = filters.bpmMin
      if (filters.bpmMax) where.bpm.lte = filters.bpmMax
    }

    if (filters.key) {
      where.key = filters.key
    }

    if (filters.priceMin || filters.priceMax) {
      where.wavLeasePrice = {}
      if (filters.priceMin) where.wavLeasePrice.gte = new Decimal(filters.priceMin)
      if (filters.priceMax) where.wavLeasePrice.lte = new Decimal(filters.priceMax)
    }

    if (filters.isExclusive !== undefined) {
      where.isExclusive = filters.isExclusive
    }

    if (filters.featured !== undefined) {
      where.featured = filters.featured
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { hasSome: [filters.search] } }
      ]
    }

    if (filters.hasStems) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { stemsUrl: { not: null } },
            { s3StemsUrl: { not: null } }
          ]
        }
      ]
    }

    // Get total count
    const total = await prisma.beat.count({ where })

    // Map 'price' to wavLeasePrice (price column was removed in favor of license-specific prices)
    const orderByField = sort.field === 'price' ? 'wavLeasePrice' : sort.field

    // Get beats with pagination
    const beats = await prisma.beat.findMany({
      where,
      orderBy: { [orderByField]: sort.order },
      skip: (page - 1) * limit,
      take: limit
    })

    const totalPages = Math.ceil(total / limit)

    return {
      beats: beats.map(beat => this.convertPrismaBeat(beat as PrismaBeatResult)),
      total,
      totalPages
    }
  }

  // Get a single beat by ID
  static async getBeatById(id: string, userId?: string, isAdmin: boolean = false): Promise<Beat | null> {
    const where: { id: string; userId?: string } = { id }
    
    // Filter by user only if provided AND user is admin
    // Regular users and non-authenticated users can see all beats
    if (userId && isAdmin) {
      where.userId = userId
    }
    
    const beat = await prisma.beat.findUnique({
      where
    })
    
    return beat ? this.convertPrismaBeat(beat as PrismaBeatResult) : null
  }

  // Get featured beats
  static async getFeaturedBeats(limit: number = 4, userId?: string, isAdmin: boolean = false): Promise<Beat[]> {
    const where: BeatWhereClause = {
      featured: true,
      isActive: true
    }
    
    // Filter by user only if provided AND user is admin
    // Regular users and non-authenticated users can see all featured beats
    if (userId && isAdmin) {
      where.userId = userId
    }
    
    const beats = await prisma.beat.findMany({
      where,
      orderBy: { rating: 'desc' },
      take: limit
    })
    
    return beats.map(beat => this.convertPrismaBeat(beat as PrismaBeatResult))
  }

  // Get beats by genre
  static async getBeatsByGenre(genre: string, limit: number = 8, userId?: string, isAdmin: boolean = false): Promise<Beat[]> {
    const where: BeatWhereClause = {
      genre,
      isActive: true
    }
    
    // Filter by user only if provided AND user is admin
    // Regular users and non-authenticated users can see all beats by genre
    if (userId && isAdmin) {
      where.userId = userId
    }
    
    const beats = await prisma.beat.findMany({
      where,
      orderBy: { rating: 'desc' },
      take: limit
    })
    
    return beats.map(beat => this.convertPrismaBeat(beat as PrismaBeatResult))
  }

  // Update a beat
  static async updateBeat(id: string, data: UpdateBeatInput, userId?: string): Promise<Beat> {
    const { wavLeasePrice, trackoutLeasePrice, unlimitedLeasePrice, ...otherData } = data
    
    // Check if beat belongs to user if userId is provided
    if (userId) {
      const existingBeat = await prisma.beat.findUnique({
        where: { id },
        select: { userId: true }
      })
      
      if (!existingBeat || existingBeat.userId !== userId) {
        throw new Error('Beat not found or access denied')
      }
    }
    
    // Create update data with proper typing
    const updateData: {
      title?: string
      description?: string
      genre?: string
      bpm?: number
      key?: string
      duration?: string
      wavLeasePrice?: Decimal
      trackoutLeasePrice?: Decimal
      unlimitedLeasePrice?: Decimal
      tags?: string[]
      previewUrl?: string
      fullUrl?: string
      isExclusive?: boolean
      isActive?: boolean
      featured?: boolean
    } = { ...otherData }
    
    if (wavLeasePrice !== undefined) {
      updateData.wavLeasePrice = new Decimal(wavLeasePrice)
    }
    if (trackoutLeasePrice !== undefined) {
      updateData.trackoutLeasePrice = new Decimal(trackoutLeasePrice)
    }
    if (unlimitedLeasePrice !== undefined) {
      updateData.unlimitedLeasePrice = new Decimal(unlimitedLeasePrice)
    }

    const updatedBeat = await prisma.beat.update({
      where: { id },
      data: updateData
    })

    return this.convertPrismaBeat(updatedBeat as PrismaBeatResult)
  }

  // Delete a beat (soft delete by setting isActive to false)
  static async deleteBeat(id: string, userId?: string): Promise<Beat> {
    // Check if beat belongs to user if userId is provided
    if (userId) {
      const existingBeat = await prisma.beat.findUnique({
        where: { id },
        select: { userId: true }
      })
      
      if (!existingBeat || existingBeat.userId !== userId) {
        throw new Error('Beat not found or access denied')
      }
    }
    
    const deletedBeat = await prisma.beat.update({
      where: { id },
      data: { isActive: false }
    })

    return this.convertPrismaBeat(deletedBeat as PrismaBeatResult)
  }

  // Update beat rating
  static async updateBeatRating(id: string, newRating: number): Promise<Beat> {
    const beat = await prisma.beat.findUnique({
      where: { id },
      select: { rating: true, reviewCount: true }
    })

    if (!beat) {
      throw new Error('Beat not found')
    }

    const totalRating = beat.rating * beat.reviewCount + newRating
    const newReviewCount = beat.reviewCount + 1
    const averageRating = totalRating / newReviewCount

    const updatedBeat = await prisma.beat.update({
      where: { id },
      data: {
        rating: averageRating,
        reviewCount: newReviewCount
      }
    })

    return this.convertPrismaBeat(updatedBeat as PrismaBeatResult)
  }

  // Get beats statistics
  static async getBeatStats() {
    const totalBeats = await prisma.beat.count({ where: { isActive: true } })
    const totalGenres = await prisma.beat.groupBy({
      by: ['genre'],
      where: { isActive: true },
      _count: { genre: true }
    })
    const averagePrice = await prisma.beat.aggregate({
      where: { isActive: true },
      _avg: { wavLeasePrice: true }
    })
    const totalRevenue = await prisma.beat.aggregate({
      where: { isActive: true },
      _sum: { wavLeasePrice: true }
    })

    return {
      totalBeats,
      totalGenres: totalGenres.length,
      averagePrice: averagePrice._avg.wavLeasePrice ? Number(averagePrice._avg.wavLeasePrice) : 0,
      totalRevenue: totalRevenue._sum.wavLeasePrice ? Number(totalRevenue._sum.wavLeasePrice) : 0
    }
  }
}
