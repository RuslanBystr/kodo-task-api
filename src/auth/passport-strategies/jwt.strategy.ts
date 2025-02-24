import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadDto } from '../../common/dto/jwt-payload.dto';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { ConfigService } from '@nestjs/config';
import { STRATEGIES } from '../../common/enums/strategies';
import { CONFIG } from '../../common/enums/config';

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
      role: payload.role ?? null,
    };
  }
}
