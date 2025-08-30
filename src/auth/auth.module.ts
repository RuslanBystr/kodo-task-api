import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { CONFIG, ENTITIES } from '../common/enums';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../user/entities/user.entity';
import { BcryptModule } from '../common/utils/libs/bcrypt/bcrypt.module';
import { UserModule } from '../user/user.module';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { EmailModule } from 'src/email/email.module';
import { MailService } from 'src/email/services/mail.service';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get(CONFIG.JWT_SECRET),
        signOptions: {
          expiresIn: configService.get(CONFIG.JWT_EXPIRATION_TIME) + 'd',
        },
      }),
    }),
    BcryptModule,
    EmailModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    GoogleStrategy,
    {
      provide: ENTITIES.USER,
      useValue: User,
    },
    MailService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
