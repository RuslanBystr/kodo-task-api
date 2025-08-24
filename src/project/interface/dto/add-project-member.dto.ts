import { IsEmail, IsString } from 'class-validator';

export class AddProjectMemberDto {
  @IsEmail()
  @IsString()
  email: string;
}
