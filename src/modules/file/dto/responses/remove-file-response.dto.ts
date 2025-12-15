import { ApiProperty } from '@nestjs/swagger';

export class RemoveFileResponseDto {
  @ApiProperty({ default: 'File was successfully deleted' })
  message: string;
}
