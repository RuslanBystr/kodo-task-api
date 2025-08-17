import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { RefreshTokenCookieDto, RegisterDto, ResetPasswordDto } from '../dto';
import { LoginResponseDto, RegisterResponseDto } from '../dto/responses';
import { bcrypt } from '../../common/utils/libs/bcrypt/bcrypt.type';
import { CONFIG, ENTITIES, LIBS } from '../../common/enums';
import { UserType } from 'src/user/types';
import { LoginDto } from '../../common/dto';
import { JwtPayload } from '../../common/types';
import { HASH_ROUNDS } from '../../common/constants';
import { User } from '../../user/entities/user.entity';
import { UserService, UserVerificationService } from '../../user/services';

@Injectable()
export class AuthService {
  constructor(
    @Inject(ENTITIES.USER)
    private readonly user: UserType,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(LIBS.BCRYPT) private readonly bcryptLib: bcrypt,
    private readonly userService: UserService,
    private readonly userVerificationService: UserVerificationService,
  ) {}

  async login({ email, password }: LoginDto): Promise<LoginResponseDto> {
    const user = await this.checkLoginCredentialsUser({ email, password });
    const token = await this.generateToken(user);
    const refreshTokenCookie = await this.getCookieWithJwtRefreshToken({
      id: user.id,
      role: user.role,
    });
    await this.userService.setCurrentRefreshToken(
      refreshTokenCookie.token,
      user.id,
    );
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      id: user.id,
      token,
      refreshTokenCookie,
    };
  }

  async refresh({ id }: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const token = await this.generateToken(user);
    const refreshTokenCookie = await this.getCookieWithJwtRefreshToken({
      id: user.id,
      role: user.role,
    });
    await this.userService.setCurrentRefreshToken(
      refreshTokenCookie.token,
      user.id,
    );
    return {
      token,
      refreshTokenCookie,
    };
  }

  async generateToken({ id, role }: JwtPayload, signOptions?: JwtSignOptions) {
    const token = await this.jwtService.signAsync(
      {
        id,
        role,
      },
      signOptions,
    );
    return token;
  }
  async getCookieWithJwtRefreshToken(
    payload: JwtPayload,
  ): Promise<RefreshTokenCookieDto> {
    const tokenExpireTimeDays = `${this.configService.get(CONFIG.JWT_REFRESH_EXPIRATION_TIME)}d`;
    const token = await this.generateToken(payload, {
      secret: this.configService.get(CONFIG.JWT_REFRESH_SECRET),
      expiresIn: tokenExpireTimeDays,
    });
    const cookieExpireTimeSeconds: number =
      parseInt(tokenExpireTimeDays) * 24 * 3600; // convert day to seconds
    const domain = this.configService.get(CONFIG.COOKIE_DOMAIN);
    const cookie = `Refresh=${token}; HttpOnly=true; Secure=true; Domain=${domain}; SameSite=Strict; Path=/; Max-Age=${cookieExpireTimeSeconds}`;
    return {
      cookie,
      token,
    };
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<RegisterResponseDto & { refreshTokenCookie: string }> {
    const existedUser = await this.userRepository.findOne({
      where: {
        email: registerDto.email,
      },
    });
    if (existedUser) {
      throw new ConflictException('This email is already taken');
    }

    const user = new this.user();
    user.firstName = registerDto.firstName;
    user.lastName = registerDto.lastName;
    user.email = registerDto.email;
    user.phone = registerDto.phone;
    user.password = await this.bcryptLib.hash(
      registerDto.password,
      HASH_ROUNDS,
    );
    const token: string = await this.generateToken(user);
    const refreshTokenCookie = await this.getCookieWithJwtRefreshToken({
      id: user.id,
      role: user.role,
    });
    user.currentHashedRefreshToken = refreshTokenCookie.token;
    await this.userRepository.save(user);

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      id: user.id,
      token,
      refreshTokenCookie: refreshTokenCookie.cookie,
    };
  }
  async checkLoginCredentialsUser({
    email,
    password,
  }: LoginDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    if (!user.status) {
      throw new BadRequestException('User was blocked');
    }
    if (user.deletedAt) {
      throw new BadRequestException('User doesn`t exist');
    }
    const isPasswordEqual = await this.verifyPassword(password, user.password);
    if (!isPasswordEqual) {
      throw new BadRequestException('Invalid credentials2');
    }
    return user;
  }

  private async verifyPassword(newPassword: string, currentPassword: string) {
    const isPassEqual = await this.bcryptLib.compare(
      newPassword,
      currentPassword,
    );
    return isPassEqual;
  }

  async resetPassword({ code, email, newPassword }: ResetPasswordDto) {
    const resetCode =
      await this.userVerificationService.validateVerificationCode({
        email,
        code,
      });
    const user = resetCode.user;
    await this.userService.setNewUserPassword(newPassword, user.id);
    await this.userVerificationService.deleteCode(resetCode);
    const token: string = await this.generateToken(user);
    const refreshTokenCookie = await this.getCookieWithJwtRefreshToken({
      id: user.id,
      role: user.role,
    });
    await this.userService.setCurrentRefreshToken(
      refreshTokenCookie.token,
      user.id,
    );

    return {
      token,
      refreshTokenCookie,
    };
  }

  getCookiesForLogOut() {
    const cookieExpireTimeSeconds: number = 0;
    const domain = this.configService.get(CONFIG.COOKIE_DOMAIN);
    return [
      `Refresh=; HttpOnly=true; Secure=true; Domain=${domain}; SameSite=Strict; Path=/; Max-Age=${cookieExpireTimeSeconds}`,
    ];
  }
}
