import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateThreadDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  systemPrompt?: string;
}
