import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionsService } from '../questions/questions.service';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionsService: QuestionsService
  ) {}

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

    let result;
    if (existing) {
      await this.prisma.favorite.delete({
        where: {
          id: existing.id,
        },
      });
      result = { isFavorite: false };
    } else {
      await this.prisma.favorite.create({
        data: {
          userId,
          questionId,
        },
      });
      result = { isFavorite: true };
    }

    // Update hot score asynchronously
    this.questionsService.updateHotScore(questionId).catch(err => 
      console.error(`Failed to update hot score for ${questionId} after favorite toggle`, err)
    );

    return result;
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
