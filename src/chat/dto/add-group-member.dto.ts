import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class AddGroupMemberDto {
  @IsNotEmpty()
  @IsNumber()
  chatId: number;

  @IsNotEmpty()
  @IsArray()
  userId: number[];
}
