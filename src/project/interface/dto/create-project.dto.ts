import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsUUID()
  image?: string;

  @IsOptional()
  @IsArray()
  members?: string[];
}
