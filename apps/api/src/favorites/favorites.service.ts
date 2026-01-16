import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleFavorite(userId: string, questionId: string) {
    // Check if favorite exists
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: {
          id: existing.id,
        },
      });
      return { isFavorite: false };
    } else {
      await this.prisma.favorite.create({
        data: {
          userId,
          questionId,
        },
      });
      return { isFavorite: true };
    }
  }

  async checkFavorite(userId: string, questionId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });
    return { isFavorite: !!existing };
  }

  async getFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        question: {
          include: {
            category: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
