import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CONFIG } from '../common/enums/config';
import * as process from 'process';
import { UsersRoleEnum } from '../user/enums/users-role.enum';
import { User } from '../user/entities/user.entity';

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
