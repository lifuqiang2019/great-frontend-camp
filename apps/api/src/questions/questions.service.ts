import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto, CreateQuestionCategoryDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  // Categories
  async createCategory(data: CreateQuestionCategoryDto) {
    return this.prisma.questionCategory.create({
      data,
    });
  }

  async removeCategory(id: string) {
    // Check if there are questions in this category
    const count = await this.prisma.question.count({
      where: { categoryId: id },
    });
    
    if (count > 0) {
      throw new Error('Cannot delete category with associated questions');
    }

    return this.prisma.questionCategory.delete({
      where: { id },
    });
  }

  async updateCategory(id: string, name: string) {
    return this.prisma.questionCategory.update({
      where: { id },
      data: { name },
    });
  }

  async findAllCategories() {
    try {
      const categories = await this.prisma.questionCategory.findMany();
      if (categories.length === 0) {
        return this.getMockCategories();
      }
      return categories;
    } catch (error) {
      console.error("Failed to fetch categories from DB, falling back to mock data:", error);
      return this.getMockCategories();
    }
  }

  private getMockCategories() {
    return [
      { id: "mock-cat-1", name: "HTML" },
      { id: "mock-cat-2", name: "CSS" },
      { id: "mock-cat-3", name: "JavaScript" },
      { id: "mock-cat-4", name: "React" },
      { id: "mock-cat-5", name: "Vue" },
      { id: "mock-cat-6", name: "Performance" },
    ];
  }

  // Questions
  async createQuestion(data: CreateQuestionDto) {
    return this.prisma.question.create({
      data,
    });
  }

  async findAllQuestions() {
    try {
      const questions = await this.prisma.question.findMany({
        include: {
          category: true,
        },
        orderBy: [
          { hotScore: 'desc' },
          { createdAt: 'desc' },
        ],
      });
      
      if (questions.length === 0) {
        return this.getMockQuestions();
      }
      
      return questions;
    } catch (error) {
      console.error("Failed to fetch questions from DB, falling back to mock data:", error);
      return this.getMockQuestions();
    }
  }

  private getMockQuestions() {
    return [
      { 
        id: "mock-q-1", 
        title: "What is a closure in JavaScript?", 
        categoryId: "mock-cat-3",
        category: { id: "mock-cat-3", name: "JavaScript" },
        content: "Explain the concept of closure.",
        solution: "A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).",
        transcript: null
      },
      { 
        id: "mock-q-2", 
        title: "Explain CSS Box Model", 
        categoryId: "mock-cat-2",
        category: { id: "mock-cat-2", name: "CSS" },
        content: "What are the components of the box model?",
        solution: "Content, Padding, Border, Margin.",
        transcript: null
      },
      { 
        id: "mock-q-3", 
        title: "React useEffect dependency array", 
        categoryId: "mock-cat-4",
        category: { id: "mock-cat-4", name: "React" },
        content: "When does useEffect run?",
        solution: "It runs after render. Dependencies control when it re-runs.",
        transcript: null
      },
    ];
  }

  async findOneQuestion(id: string) {
    if (id.startsWith("mock-q-")) {
      const mockQuestions = this.getMockQuestions();
      return mockQuestions.find(q => q.id === id);
    }

    try {
      // Async increment view count
      this.incrementViewCount(id).catch(err => console.error(`Failed to increment view count for ${id}`, err));

      return await this.prisma.question.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });
    } catch (error) {
      console.error(`Failed to fetch question ${id} from DB:`, error);
      throw error;
    }
  }

  async incrementViewCount(id: string) {
    try {
      // 1. Increment viewCount
      const question = await this.prisma.question.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });

      // 2. Recalculate hotScore
      await this.updateHotScore(id);
    } catch (error) {
      console.error(`Error incrementing view count for ${id}:`, error);
    }
  }

  async updateHotScore(id: string) {
    try {
      const question = await this.prisma.question.findUnique({
        where: { id },
        include: {
          _count: {
            select: { favorites: true },
          },
        },
      });

      if (!question) return;

      // Algorithm:
      // HotScore = Views * 1 + Favorites * 10
      // Simple and effective for early stage
      const views = question.viewCount || 0;
      const favorites = question['_count']?.favorites || 0;
      const score = views + (favorites * 10);

      await this.prisma.question.update({
        where: { id },
        data: { hotScore: score },
      });
    } catch (error) {
      console.error(`Error updating hot score for ${id}:`, error);
    }
  }

  async updateQuestion(id: string, data: Partial<CreateQuestionDto>) {
    return this.prisma.question.update({
      where: { id },
      data,
    });
  }

  async removeQuestion(id: string) {
    return this.prisma.question.delete({
      where: { id },
    });
  }

  private async deleteQuestionsByIds(ids: string[]) {
    if (ids.length === 0) {
      return { count: 0 };
    }

    return this.prisma.$transaction(async (tx) => {
      // 先删除关联的收藏
      await tx.favorite.deleteMany({
        where: {
          questionId: { in: ids },
        },
      });

      // 再删除题目
      return tx.question.deleteMany({
        where: {
          id: { in: ids },
        },
      });
    });
  }

  async removeQuestionsByHotScoreThreshold(threshold: number) {
    // 1. 查找所有 hotScore <= threshold 的题目 ID
    const questions = await this.prisma.question.findMany({
      where: { hotScore: { lte: threshold } },
      select: { id: true },
    });

    const ids = questions.map(q => q.id);
    return this.deleteQuestionsByIds(ids);
  }

  async removeQuestionsByCategory(categoryId: string) {
    // 1. 查找该分类下的所有题目 ID
    const questions = await this.prisma.question.findMany({
      where: { categoryId },
      select: { id: true },
    });

    const ids = questions.map(q => q.id);
    return this.deleteQuestionsByIds(ids);
  }
}
