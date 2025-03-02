import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LIBS } from '../../common/enums/libs';
import { bcrypt } from '../../utils/libs/bcrypt/bcrypt.type';
import { HASH_ROUNDS } from '../../common/constants/auth';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { UserVerificationService } from './user-verification.service';
import { MailService } from '../../email/services/mail.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { FileEntity } from '../../file/entities/file.entity';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateUserResponseDto } from '../dto/responses/update-user-response.dto';
import { GetUserResponseDto } from '../dto/responses/get-user-response.dto';
import { FileService } from '../../file/services/file.service';
import { UpdatePhoneDto } from '../dto/update-phone.dto';
import { UpdateEmailDto } from '../dto/update-email.dto';
import { ChangePhoneResponseDto } from '../dto/responses/change-phone-response.dto';
import { ChangeEmailResponseDto } from '../dto/responses/change-email-response.dto';
import { UserCreateDto } from '../dto/user-create-dto';
import { UserSortByEnum } from '../enums/user-sort.enum';
import { SortOrderEnum } from 'src/common/enums/sort-order.enum';
import { GetAllUsersFilterDto } from '../dto/get-all-users-filters.dto';
import { generateSearchConditionsUser } from '../utils/search-condition-users';
import { UserGetAllResponseDto } from '../dto/responses/user-get-all-response.dto';

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

  async sendVerifyCode(id: number, email = null) {
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

  async changePhone(
    { phone, code }: UpdatePhoneDto,
    id: number,
  ): Promise<ChangePhoneResponseDto> {
    const user: User = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    //uncomment if need to check phone for unique
    // const existUser = await this.userRepository.findOne({
    //   where: {
    //     phone: phone,
    //     id: Not(id),
    //   },
    // });
    // if (phone) {
    //   throw new BadRequestException('User with such phone already exist');
    // }
    const verifyCode =
      await this.userVerificationService.validateVerificationCode({
        email: user.email,
        code,
      });
    await this.userRepository.update({ id }, { phone });
    await this.userVerificationService.deleteCode(verifyCode);
    return {
      phone,
    };
  }

  // CRUD USER

  async createUser(createDto: UserCreateDto): Promise<User> {
    await this.checkEmailAvailability({ email: createDto.email });
    const password = await this.bcryptLib.hash(createDto.password, HASH_ROUNDS);
    const user = this.userRepository.create({
      ...createDto,
      password,
    });
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

  public async findAll({
    page = 1,
    limit = 10,
    sortBy = UserSortByEnum.CREATED_AT,
    order = SortOrderEnum.ASC,
    ...searchFilterFields
  }: GetAllUsersFilterDto): Promise<UserGetAllResponseDto> {
    const skip = (page - 1) * limit;

    const conditions: FindOptionsWhere<User> =
      generateSearchConditionsUser<User>(searchFilterFields);

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
    Object.assign<User, Partial<User>>(user, updateDto);
    await this.userRepository.save(user);
    return {
      id: user.id,
      ...updateDto,
      email: user.email,
      phone: user.phone,
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
