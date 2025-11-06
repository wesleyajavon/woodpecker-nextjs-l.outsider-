import { prisma } from './prisma'

/**
 * Récupère l'ID utilisateur depuis son email
 * @param email - L'email de l'utilisateur
 * @returns L'ID utilisateur ou null si non trouvé
 */
export async function getUserIdFromEmail(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  })
  return user?.id || null
}

/**
 * Récupère l'utilisateur complet depuis son email
 * @param email - L'email de l'utilisateur
 * @returns L'utilisateur complet ou null si non trouvé
 */
export async function getUserFromEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true
    }
  })
}












