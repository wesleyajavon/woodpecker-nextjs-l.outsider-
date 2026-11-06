/** Champs beat renvoyés par les routes de commande publiques. Même liste que le lookup. */
export const publicOrderBeatSelect = {
  id: true,
  title: true,
  genre: true,
  bpm: true,
  key: true,
  duration: true,
  wavLeasePrice: true,
  trackoutLeasePrice: true,
  unlimitedLeasePrice: true,
  isExclusive: true,
  featured: true,
  artworkUrl: true,
  stemsUrl: true,
  s3StemsKey: true,
} as const

type BeatWithStemFlags = {
  stemsUrl: string | null
  s3StemsKey: string | null
}

/** Retire les URL et clés de stems. `hasStems` reste le seul signal. */
export function toPublicOrderBeat<T extends BeatWithStemFlags>(beat: T) {
  const { stemsUrl, s3StemsKey, ...rest } = beat
  return {
    ...rest,
    hasStems: s3StemsKey != null || stemsUrl != null,
  }
}
