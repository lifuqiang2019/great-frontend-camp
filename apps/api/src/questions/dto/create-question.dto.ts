import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateQuestionCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  solution?: string;

  @IsString()
  @IsOptional()
  transcript?: string;

  @IsString()
  @IsOptional()
  interviewerQuestion?: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;
}
