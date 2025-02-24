import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { LoginDto } from '../../common/dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { LIBS } from '../../common/enums/libs';
import { bcrypt } from '../../utils/libs/bcrypt/bcrypt.type';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { ENTITIES } from '../../common/enums/entities';
import { UserType } from '../../user/types/user.type';
import { LoginResponseDto } from '../dto/responses/login-response.dto';
import { RegisterResponseDto } from '../dto/responses/register-response.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UserService } from '../../user/services/user.service';
import { UserVerificationService } from '../../user/services/user-verification.service';
import { HASH_ROUNDS } from '../../common/constants/auth';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from '../../common/enums/config';
import { RefreshTokenCookieDto } from '../dto/refresh-token-cookie.dto';

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

  async generateToken({ id }: JwtPayload, signOptions?: JwtSignOptions) {
    const token = await this.jwtService.signAsync(
      {
        id,
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
