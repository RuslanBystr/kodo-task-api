import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CONFIG } from '../common/enums';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { userEntityProvider } from '../user/providers/user-entity.provider';
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
    userEntityProvider,
    MailService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
