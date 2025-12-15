import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class RemoveProjectMemberDto {
  @ApiProperty({
    description: 'The ID of the user to remove from the project',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
