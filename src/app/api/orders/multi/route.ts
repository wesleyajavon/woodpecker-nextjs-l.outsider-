import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database to check role and get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch multi-item orders with items and beat information, filtered by admin user's beats
    const orders = await prisma.multiItemOrder.findMany({
      where: {
        items: {
          some: {
            beat: {
              userId: user.id
            }
          }
        }
      },
      include: {
        items: {
          where: {
            beat: {
              userId: user.id
            }
          },
          include: {
            beat: {
              select: {
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
                fullUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      orders: orders,
      total: orders.length,
      page: 1,
      limit: orders.length
    });

  } catch (error) {
    console.error('Error fetching multi-item orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
