import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format seconds as M:SS (e.g. 65 → "1:05") */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Génère une valeur Content-Disposition RFC 5987 compatible avec les caractères non-ASCII.
 * Les en-têtes HTTP doivent être ASCII ; les noms avec accents (é, ü, etc.) causent des erreurs Vercel.
 */
export function getContentDispositionAttachment(filename: string): string {
  // Fallback ASCII : remplacer les caractères accentués pour les anciens clients
  const asciiFallback = filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les diacritiques (é -> e)
    .replace(/[^\x20-\x7E]/g, '_') // Remplacer tout autre non-ASCII par _
  const base = `attachment; filename="${asciiFallback}"`
  // RFC 5987 : filename*=UTF-8''percent-encoded pour les navigateurs modernes
  const hasNonAscii = /[^\x20-\x7E]/.test(filename)
  if (hasNonAscii) {
    const encoded = encodeURIComponent(filename)
    return `${base}; filename*=UTF-8''${encoded}`
  }
  return base
}
