import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayloadDto } from '../../common/dto';
import { CONFIG, STRATEGIES } from '../../common/enums';
import { JwtPayload } from '../../common/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, STRATEGIES.JWT) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(CONFIG.JWT_SECRET),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayloadDto> {
    return {
      id: payload.id,
      role: payload.role,
    };
  }
}
