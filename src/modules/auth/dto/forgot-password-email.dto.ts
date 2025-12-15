import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordEmailDto {
  @ApiProperty({ example: 'email@email.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
