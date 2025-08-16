import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { STRATEGIES } from '../../common/enums';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services';
import { Request } from 'express';
import { CONFIG } from '../../common/enums';
import { JwtPayload } from '../../common/types';

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
