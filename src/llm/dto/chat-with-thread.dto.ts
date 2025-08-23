import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ChatWithThreadDto {
  @IsString()
  @MaxLength(8000)
  prompt!: string;

  @IsOptional()
  @IsString()
  threadId?: string;

  @IsOptional()
  @IsString()
  systemPrompt?: string;
}
