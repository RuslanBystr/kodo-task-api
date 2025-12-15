import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ENTITIES } from '../../common/enums';
import { MailModule } from '../../infra/mail';
import { RabbitmqModule } from '../../infra/rabbitmq';
import { FileEntity } from '../file/entities/file.entity';
import { FileModule } from '../file/file.module';
import { SupportController } from './controllers/support.controller';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { UserVerification } from './entities/user-verification.entity';
import { UserService } from './services/user.service';
import { UserVerificationService } from './services/user-verification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserVerification, FileEntity]),
    MailModule,
    FileModule,
    RabbitmqModule,
  ],
  controllers: [UserController, SupportController],
  providers: [
    UserService,
    UserVerificationService,
    {
      provide: ENTITIES.USER_VERIFICATION,
      useValue: UserVerification,
    },
  ],
  exports: [UserService, ENTITIES.USER_VERIFICATION, UserVerificationService],
})
export class UserModule {}
