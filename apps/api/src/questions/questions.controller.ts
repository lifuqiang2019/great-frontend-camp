import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, CreateQuestionCategoryDto } from './dto/create-question.dto';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post('categories')
  @UseGuards(AdminGuard)
  createCategory(@Body() createCategoryDto: CreateQuestionCategoryDto) {
    return this.questionsService.createCategory(createCategoryDto);
  }

  @Patch('categories/:id')
  @UseGuards(AdminGuard)
  updateCategory(@Param('id') id: string, @Body() body: { name: string }) {
    return this.questionsService.updateCategory(id, body.name);
  }

  @Delete('categories/:id')
  @UseGuards(AdminGuard)
  removeCategory(@Param('id') id: string) {
    return this.questionsService.removeCategory(id);
  }

  @Get('categories')
  findAllCategories() {
    return this.questionsService.findAllCategories();
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.createQuestion(createQuestionDto);
  }

  @Get()
  findAll() {
    return this.questionsService.findAllQuestions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOneQuestion(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateQuestionDto: Partial<CreateQuestionDto>) {
    return this.questionsService.updateQuestion(id, updateQuestionDto);
  }


  @Delete('batch/by-score')
  @UseGuards(AdminGuard)
  removeByScore(@Query('threshold') threshold: string) {
    const limit = parseInt(threshold, 10) || 0;
    return this.questionsService.removeQuestionsByHotScoreThreshold(limit);
  }

  @Delete('batch/by-category')
  @UseGuards(AdminGuard)
  removeByCategory(@Query('categoryId') categoryId: string) {
    return this.questionsService.removeQuestionsByCategory(categoryId);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.questionsService.removeQuestion(id);
  }
}
