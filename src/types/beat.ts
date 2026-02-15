export interface Beat {
  id: string
  title: string
  description?: string | null
  genre: string
  bpm: number
  key: string
  mode?: string // 'majeur' (Major) ou 'mineur' (Minor)
  duration: string
  // Prix par type de licence
  wavLeasePrice: number
  trackoutLeasePrice: number
  unlimitedLeasePrice: number
  rating: number
  reviewCount: number
  tags: string[]
  stripePriceId?: string | null // Deprecated
  previewUrl?: string | null
  fullUrl?: string | null
  stemsUrl?: string | null
  artworkUrl?: string | null
  
  // S3 URLs for large files
  s3MasterUrl?: string | null
  s3StemsUrl?: string | null
  s3MasterKey?: string | null
  s3StemsKey?: string | null
  
  // Stripe Price IDs for each license type
  stripeWavPriceId?: string | null
  stripeTrackoutPriceId?: string | null
  stripeUnlimitedPriceId?: string | null
  isExclusive: boolean
  isActive: boolean
  featured: boolean
  scheduledReleaseAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateBeatInput {
  title: string
  description?: string
  genre: string
  bpm: number
  key: string
  mode?: string
  duration: string
  wavLeasePrice: number
  trackoutLeasePrice: number
  unlimitedLeasePrice: number
  tags: string[]
  previewUrl?: string
  fullUrl?: string
  stemsUrl?: string
  artworkUrl?: string
  s3MasterUrl?: string
  s3StemsUrl?: string
  s3MasterKey?: string
  s3StemsKey?: string
  isExclusive?: boolean
  featured?: boolean
  scheduledReleaseAt?: Date | null
}

export interface UpdateBeatInput {
  title?: string
  description?: string
  genre?: string
  bpm?: number
  key?: string
  mode?: string
  duration?: string
  wavLeasePrice?: number
  trackoutLeasePrice?: number
  unlimitedLeasePrice?: number
  tags?: string[]
  previewUrl?: string
  fullUrl?: string
  stemsUrl?: string
  artworkUrl?: string
  s3MasterUrl?: string
  s3StemsUrl?: string
  s3MasterKey?: string
  s3StemsKey?: string
  isExclusive?: boolean
  isActive?: boolean
  featured?: boolean
  
  // Stripe Price IDs
  stripeWavPriceId?: string | null
  stripeTrackoutPriceId?: string | null
  stripeUnlimitedPriceId?: string | null
  scheduledReleaseAt?: Date | null
}

export interface BeatFilters {
  genre?: string
  bpmMin?: number
  bpmMax?: number
  key?: string
  priceMin?: number
  priceMax?: number
  hasStems?: boolean
  isExclusive?: boolean
  featured?: boolean
  search?: string
}

export interface BeatSortOptions {
  field: 'title' | 'genre' | 'bpm' | 'price' | 'rating' | 'createdAt'
  order: 'asc' | 'desc'
}
