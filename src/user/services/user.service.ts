import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Not, Repository } from 'typeorm';

import { HASH_ROUNDS } from '../../common/constants';
import { LIBS, SortOrderEnum } from '../../common/enums';
import { generateSearchConditions } from '../../common/utils';
import { bcrypt } from '../../common/utils/libs/bcrypt/bcrypt.type';
import { MailService } from '../../email/services/mail.service';
import { FileEntity } from '../../file/entities/file.entity';
import { FileService } from '../../file/services/file.service';
import {
  GetAllUsersFilterDto,
  UpdateEmailDto,
  UpdatePasswordDto,
  UpdateUserDto,
  UserCreateDto,
} from '../dto';
import {
  ChangeEmailResponseDto,
  GetUserResponseDto,
  UpdateUserResponseDto,
  UserGetAllResponseDto,
} from '../dto/responses';
import { User } from '../entities/user.entity';
import { UserSortByEnum } from '../enums';
import { UserVerificationService } from './user-verification.service';
import { RabbitMQService } from '../../rabbitmq/services/rabbitmq.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(LIBS.BCRYPT) private readonly bcryptLib: bcrypt,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userVerificationService: UserVerificationService,
    private readonly mailService: MailService,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileService: FileService,
    private readonly rabbitmqService: RabbitMQService,
  ) {}

  async checkEmailAvailability({ email }: { email: string }) {
    const existedEmail = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    if (existedEmail) {
      throw new ConflictException('Email has been already taken');
    }
  }

  async setNewUserPassword(newPassword: string, userId: number) {
    const password = await this.bcryptLib.hash(newPassword, HASH_ROUNDS);
    await this.userRepository.update({ id: userId }, { password });
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await this.bcryptLib.hash(
      refreshToken,
      HASH_ROUNDS,
    );
    await this.userRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }

  async sendForgotPasswordCode(email: string) {
    const user: User = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { code } = await this.userVerificationService.getVerificationCode(
      user,
      { isResetCode: true },
    );
    await this.mailService.sendForgotPassword({
      email,
      name: user.firstName + user.lastName,
      code,
    });
    return {
      success: true,
    };
  }

  async updatePassword(
    userId: number,
    { newPassword, currentPassword }: UpdatePasswordDto,
  ): Promise<void> {
    const user: User = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!(await this.bcryptLib.compare(currentPassword, user.password))) {
      throw new BadRequestException('Invalid password');
    }
    await this.setNewUserPassword(newPassword, user.id);
  }

  async getProfile(id: number): Promise<GetUserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    this.rabbitmqService.sendMessage(
      `Authorized user: ${user.email}\n${user.firstName} ${user.lastName}`,
    );
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      isBlocked: user.isBlocked,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, id: number) {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: null, status: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isRefreshTokenMatching = await this.bcryptLib.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    if (isRefreshTokenMatching) {
      return {
        id: user.id,
      };
    }
  }

  async removeRefreshToken(userId: number) {
    return this.userRepository.update(userId, {
      currentHashedRefreshToken: null,
    });
  }

  async sendVerifyCode(id: number, email: string = null) {
    const user: User = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { code } = await this.userVerificationService.getVerificationCode(
      user,
      { email },
    );
    await this.mailService.sendVerifyCode({
      email: email ?? user.email,
      name: user.firstName + user.lastName,
      code,
    });
    return {
      success: true,
    };
  }

  async changeEmail(
    { email, code }: UpdateEmailDto,
    id: number,
  ): Promise<ChangeEmailResponseDto> {
    const user: User = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const existUser = await this.userRepository.findOne({
      where: {
        email: email,
        id: Not(id),
      },
    });
    if (existUser) {
      throw new BadRequestException('User with such email already exist');
    }
    const verifyCode =
      await this.userVerificationService.validateVerificationCode({
        email: user.email,
        code,
        newEmail: email,
      });
    await this.userRepository.update({ id }, { email });
    await this.userVerificationService.deleteCode(verifyCode);
    return {
      email,
    };
  }

  async createUser(createDto: UserCreateDto): Promise<User> {
    await this.checkEmailAvailability({ email: createDto.email });
    let password = createDto.password;
    if (password) {
      password = await this.bcryptLib.hash(createDto.password, HASH_ROUNDS);
    }
    const user = this.userRepository.create({
      ...createDto,
      password,
    });
    this.rabbitmqService.sendMessage(
      `New user created ${user.email}\n${user.firstName} ${user.lastName}`,
    );
    return this.userRepository.save(user);
  }

  async findById(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'status',
        'avatar',
        'isBlocked',
        'createdAt',
        'updatedAt',
        'phone',
      ],
    });
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'status',
        'avatar',
        'isBlocked',
        'createdAt',
        'updatedAt',
        'phone',
      ],
    });
  }

  public async findAll({
    page = 1,
    limit = 10,
    sortBy = UserSortByEnum.CREATED_AT,
    order = SortOrderEnum.ASC,
    ...searchFilterFields
  }: GetAllUsersFilterDto): Promise<UserGetAllResponseDto> {
    const skip = (page - 1) * limit;

    const conditions: FindOptionsWhere<User> =
      generateSearchConditions<User>(searchFilterFields);

    if (searchFilterFields.id && !Number.isNaN(Number(searchFilterFields.id))) {
      conditions.id = Number(searchFilterFields.id);
    }

    const [userItems, total] = await this.userRepository.findAndCount({
      select: [
        'id',
        'firstName',
        'phone',
        'lastName',
        'email',
        'status',
        'avatar',
        'isBlocked',
        'createdAt',
        'updatedAt',
      ],
      where: conditions,
      skip,
      take: limit,
      order: { [sortBy]: order },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: userItems,
      meta: {
        totalItems: total,
        itemCount: userItems.length,
        itemsPerPage: Number(limit),
        totalPages,
        currentPage: Number(page),
      },
    };
  }

  async updateUser(
    updateDto: UpdateUserDto,
    id: number,
  ): Promise<UpdateUserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (updateDto.avatarFileUUID) {
      const oldFile = await this.fileRepository.findOne({
        where: { uuid: updateDto.avatarFileUUID },
      });
      if (!oldFile) {
        throw new NotFoundException('File not found');
      }
      await this.fileService.deleteFile(oldFile.uuid, user.id);
    }
    if (updateDto.password) {
      updateDto.password = await this.bcryptLib.hash(
        updateDto.password,
        HASH_ROUNDS,
      );
    } else {
      updateDto.password = user.password;
    }
    Object.assign<User, Partial<User>>(user, updateDto);
    await this.userRepository.save(user);
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      ...updateDto,
    };
  }

  async remove(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return await this.userRepository.remove(user);
  }
}
