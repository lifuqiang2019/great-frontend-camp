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
    const categories = await this.prisma.questionCategory.findMany();
    if (categories.length === 0) {
      return [
        { id: "mock-cat-1", name: "HTML" },
        { id: "mock-cat-2", name: "CSS" },
        { id: "mock-cat-3", name: "JavaScript" },
        { id: "mock-cat-4", name: "React" },
        { id: "mock-cat-5", name: "Vue" },
        { id: "mock-cat-6", name: "Performance" },
      ];
    }
    return categories;
  }

  // Questions
  async createQuestion(data: CreateQuestionDto) {
    return this.prisma.question.create({
      data,
    });
  }

  async findAllQuestions() {
    const questions = await this.prisma.question.findMany({
      include: {
        category: true,
      },
    });
    
    if (questions.length === 0) {
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
    
    return questions;
  }

  async findOneQuestion(id: string) {
    if (id.startsWith("mock-q-")) {
      const mockQuestions = [
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
      return mockQuestions.find(q => q.id === id);
    }

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
