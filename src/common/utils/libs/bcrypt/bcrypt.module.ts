import { Global, Module } from '@nestjs/common';
import { bcryptProvider } from './bcrypt.provider';

@Global()
@Module({
  providers: [bcryptProvider],
  exports: [bcryptProvider],
})
export class BcryptModule {}
