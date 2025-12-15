import { ApiProperty } from '@nestjs/swagger';

import { IceServerDto } from './ice-server.dto';

export class IceConfigDto {
  @ApiProperty({ type: [IceServerDto] })
  iceServers: IceServerDto[];

  @ApiProperty()
  ttl: number;

  @ApiProperty({ required: false })
  expiry?: number;
}
