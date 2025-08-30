import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  StrategyOptions,
  VerifyCallback,
} from 'passport-google-oauth20';

import { CONFIG } from '../../common/enums';
import { UserService } from '../../user/services';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      clientID: configService.get<string>(CONFIG.GOOGLE_CLIENT_ID),
      clientSecret: configService.get<string>(CONFIG.GOOGLE_CLIENT_SECRET),
      callbackURL: configService.get<string>(CONFIG.GOOGLE_CALLBACK_URL),
      scope: ['profile', 'email'],
      prompt: 'consent',
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      emails: { value: string }[];
      name: { givenName: string; familyName: string };
    },
    done: VerifyCallback,
  ) {
    const { emails, name } = profile;
    const email = emails[0].value;

    let user = await this.userService.findByEmail(email);
    if (!user) {
      user = await this.userService.createUser({
        email,
        firstName: name.givenName,
        lastName: name.familyName,
        password: null,
      });
    }

    done(null, user);
  }
}
