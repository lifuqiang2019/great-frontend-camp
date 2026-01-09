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

  async findAllCategories() {
    return this.prisma.questionCategory.findMany();
  }

  // Questions
  async createQuestion(data: CreateQuestionDto) {
    return this.prisma.question.create({
      data,
    });
  }

  async findAllQuestions() {
    return this.prisma.question.findMany({
      include: {
        category: true,
      },
    });
  }

  async findOneQuestion(id: string) {
    return this.prisma.question.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
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
}
