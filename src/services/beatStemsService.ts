import { Decimal } from '@prisma/client/runtime/library'
import { S3_CONFIG } from '@/lib/aws-s3'
import { prisma } from '@/lib/prisma'
import { s3Service } from '@/lib/s3-service'
import type { Beat } from '@/types/beat'

const STEMS_KEY_PREFIX = `${S3_CONFIG.folders.BEATS.STEMS}/`

type PrismaBeatWithDecimalPrices = Omit<
  Beat,
  'wavLeasePrice' | 'trackoutLeasePrice' | 'unlimitedLeasePrice'
> & {
  wavLeasePrice: Decimal
  trackoutLeasePrice: Decimal
  unlimitedLeasePrice: Decimal
}

function toBeat(beat: PrismaBeatWithDecimalPrices): Beat {
  return {
    ...beat,
    wavLeasePrice: Number(beat.wavLeasePrice),
    trackoutLeasePrice: Number(beat.trackoutLeasePrice),
    unlimitedLeasePrice: Number(beat.unlimitedLeasePrice),
  }
}

async function deleteStemsKeyBestEffort(key: string): Promise<void> {
  try {
    await s3Service.deleteFile(key)
  } catch (error) {
    console.error('Échec de la suppression S3 des stems:', key, error)
  }
}

async function findBeatOrThrow(beatId: string) {
  const beat = await prisma.beat.findUnique({ where: { id: beatId } })
  if (!beat) {
    throw new Error('Beat non trouvé')
  }
  return beat
}

export async function clearBeatStems(beatId: string): Promise<Beat> {
  const beat = await findBeatOrThrow(beatId)
  const previousKey = beat.s3StemsKey

  const updated = await prisma.beat.update({
    where: { id: beatId },
    data: {
      stemsUrl: null,
      s3StemsUrl: null,
      s3StemsKey: null,
    },
  })

  if (previousKey) {
    await deleteStemsKeyBestEffort(previousKey)
  }

  return toBeat(updated as PrismaBeatWithDecimalPrices)
}

export async function attachBeatStems(
  beatId: string,
  input: { url: string; key: string }
): Promise<Beat> {
  const url = input.url.trim()
  const key = input.key.trim()

  if (!url) {
    throw new Error('URL des stems requise')
  }
  if (!key) {
    throw new Error('Clé S3 des stems requise')
  }
  if (!key.startsWith(STEMS_KEY_PREFIX)) {
    throw new Error('Clé S3 hors du préfixe beats/stems/')
  }

  const beat = await findBeatOrThrow(beatId)
  const previousKey = beat.s3StemsKey

  const updated = await prisma.beat.update({
    where: { id: beatId },
    data: {
      stemsUrl: url,
      s3StemsUrl: url,
      s3StemsKey: key,
    },
  })

  if (previousKey && previousKey !== key) {
    await deleteStemsKeyBestEffort(previousKey)
  }

  return toBeat(updated as PrismaBeatWithDecimalPrices)
}
