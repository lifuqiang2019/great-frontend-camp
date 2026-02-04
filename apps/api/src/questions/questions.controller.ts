import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, CreateQuestionCategoryDto } from './dto/create-question.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateQuestionCategoryDto) {
    return this.questionsService.createCategory(createCategoryDto);
  }

  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.questionsService.removeCategory(id);
  }

  @Get('categories')
  findAllCategories() {
    return this.questionsService.findAllCategories();
  }

  @Post()
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
  update(@Param('id') id: string, @Body() updateQuestionDto: Partial<CreateQuestionDto>) {
    return this.questionsService.updateQuestion(id, updateQuestionDto);
  }


  @Delete('batch/by-score')
  removeByScore(@Query('threshold') threshold: string) {
    const limit = parseInt(threshold, 10) || 0;
    return this.questionsService.removeQuestionsByHotScoreThreshold(limit);
  }

  @Delete('batch/by-category')
  removeByCategory(@Query('categoryId') categoryId: string) {
    return this.questionsService.removeQuestionsByCategory(categoryId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.removeQuestion(id);
  }
}
