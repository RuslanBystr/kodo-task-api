import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  StrategyOptions,
  VerifyCallback,
} from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';
import { CONFIG } from 'src/common/enums/config';

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
    profile: any,
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
