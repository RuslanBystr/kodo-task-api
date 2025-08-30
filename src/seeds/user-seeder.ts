import * as bcrypt from 'bcrypt';
import * as process from 'process';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { CONFIG } from '../common/enums';
import { User } from '../user/entities/user.entity';
import { UsersRoleEnum } from '../user/enums';

export class UserSeeder implements Seeder {
  private SAULT = 10;

  public async run(dataSource: DataSource): Promise<void> {
    const ADMIN_EMAIL = process.env[CONFIG.ADMIN_EMAIL];
    const ADMIN_PASSWORD = process.env[CONFIG.ADMIN_PASSWORD];
    const userRepository = dataSource.getRepository(User);

    const newUserData: Partial<User> = {
      firstName: 'John',
      lastName: 'Developer',
      email: ADMIN_EMAIL,
      password: await bcrypt.hash(ADMIN_PASSWORD, this.SAULT),
      role: UsersRoleEnum.ADMIN,
    };

    const existedUser = await userRepository.findOneBy({
      email: newUserData.email,
    });
    if (!existedUser) {
      const newUser = userRepository.create(newUserData);
      await userRepository.save(newUser);
    }
  }
}
