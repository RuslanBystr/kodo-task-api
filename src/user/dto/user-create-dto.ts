import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  IsBoolean,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsStrongPassword,
} from 'class-validator';

export class UserCreateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  public userName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  public firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  public lastName?: string;

  @ApiProperty()
  @IsEmail()
  public email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @IsStrongPassword({
    minSymbols: 0,
  })
  public password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  public status?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(10, 15)
  public phone?: string;

  // @ApiPropertyOptional()
  // @IsOptional()
  // public avatar?: FileEntity;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  public isBlocked?: boolean;
}
