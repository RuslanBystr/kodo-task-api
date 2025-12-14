import { ApiProperty } from '@nestjs/swagger';

export class IceServerDto {
  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  urls: string | string[];

  @ApiProperty({ required: false })
  username?: string;

  @ApiProperty({ required: false })
  credential?: string;
}
