import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { CONFIG, STRATEGIES } from '../../common/enums';
import { JwtPayload } from '../../common/types';
import { UserService } from '../../user/services';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  STRATEGIES.JWT_REFRESH_TOKEN,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Refresh;
        },
      ]),
      secretOrKey: configService.get(CONFIG.JWT_REFRESH_SECRET),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayload) {
    const refreshToken = request.cookies?.Refresh;
    return await this.userService.getUserIfRefreshTokenMatches(
      refreshToken,
      payload.id,
    );
  }
}
