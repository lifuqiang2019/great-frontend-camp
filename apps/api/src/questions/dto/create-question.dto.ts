export class CreateQuestionCategoryDto {
  name: string;
}

export class CreateQuestionDto {
  title: string;
  content?: string;
  solution?: string;
  transcript?: string;
  categoryId: string;
}
