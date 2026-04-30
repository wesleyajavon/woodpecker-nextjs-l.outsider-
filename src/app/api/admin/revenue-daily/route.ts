import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUserIdFromEmail } from '@/lib/userUtils';
import { isUserAdmin } from '@/lib/roleUtils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Vérification du rôle admin
    const isAdmin = await isUserAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé. Rôle admin requis.' },
        { status: 403 }
      );
    }

    // Récupération de l'ID utilisateur (admin)
    const userId = await getUserIdFromEmail(session.user.email);
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Get query parameters for date range (default to last 30 days)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Query for daily revenue from cart (multi-item) orders
    const multiOrders = await prisma.multiItemOrder.findMany({
      where: {
        items: {
          some: {
            beat: {
              userId: userId
            }
          }
        },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        createdAt: true,
        totalAmount: true
      }
    });

    const dailyRevenue: { [key: string]: number } = {};

    multiOrders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + Number(order.totalAmount || 0);
    });

    // Convert to array format and fill missing days with 0
    const dailyRevenueData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyRevenueData.push({
        date: dateKey,
        revenue: dailyRevenue[dateKey] || 0,
        formattedDate: currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      success: true,
      data: dailyRevenueData,
      totalRevenue: Object.values(dailyRevenue).reduce((sum, revenue) => sum + revenue, 0),
      averageDailyRevenue: dailyRevenueData.length > 0 ? 
        Object.values(dailyRevenue).reduce((sum, revenue) => sum + revenue, 0) / dailyRevenueData.length : 0
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des revenus quotidiens:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
