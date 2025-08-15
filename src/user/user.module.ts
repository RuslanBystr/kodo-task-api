import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService, UserVerificationService } from './services';
import { UserController } from './controllers/user.controller';
import { EmailModule } from '../email/email.module';
import { UserVerification } from './entities/user-verification.entity';
import { userVerificationEntityProvider } from './providers/user-verification-entity.provider';
import { FileEntity } from '../file/entities/file.entity';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserVerification, FileEntity]),
    EmailModule,
    FileModule,
  ],
  providers: [
    UserService,
    UserVerificationService,
    userVerificationEntityProvider,
  ],
  exports: [
    UserService,
    userVerificationEntityProvider,
    UserVerificationService,
  ],
  controllers: [UserController],
})
export class UserModule {}
