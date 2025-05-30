import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddProjectMemberDto {
  @ApiProperty({
    description: 'The ID of the user to add as a project member',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
