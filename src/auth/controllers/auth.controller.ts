import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../../common/dto';
import { UserService } from '../../user/services';
import { GetJwtPayload } from '../../common/utils/decorators';
import { JwtPayload } from '../../common/types';
import { GoogleAuthGuard, JwtAuthGuard, JwtRefreshGuard } from '../guards';
import {
  ForgotPasswordApiDocs,
  LoginApiDocs,
  RegisterApiDocs,
  ResetPasswordApiDocs,
} from '../docs';
import { GetLogoutApiDocs, GetRefreshApiDocs } from '../../user/docs';
import { ForgotPasswordEmailDto, RegisterDto, ResetPasswordDto } from '../dto';
import { CONFIG } from '../../common/enums';

@ApiTags('auth user')
@Controller('auth')
export class AuthController {
  private baseFrontendUrl: string;
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.baseFrontendUrl = configService.get(CONFIG.FRONTEND_URL);
  }

  @LoginApiDocs()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const response = await this.authService.login(loginDto);
    res.setHeader('Set-Cookie', [response.refreshTokenCookie.cookie]);
    delete response.refreshTokenCookie;
    res.json(response).end();
  }
  @Get('/google/login')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    return { message: '' };
  }

  @Get('/google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleRedirect(@Req() req: Request, @Res() res: Response) {
    const token = await this.authService.generateToken({ id: req.user.id });
    return res.redirect(`${this.baseFrontendUrl}/auth/success?token=${token}`);
  }

  @GetRefreshApiDocs()
  @UseGuards(JwtRefreshGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@GetJwtPayload() user: JwtPayload, @Res() res: Response) {
    const response = await this.authService.refresh(user);
    res.setHeader('Set-Cookie', [response.refreshTokenCookie.cookie]);
    delete response.refreshTokenCookie;
    res.json(response).end();
  }

  @RegisterApiDocs()
  @Post('/register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const response = await this.authService.register(registerDto);
    res.setHeader('Set-Cookie', [response.refreshTokenCookie]);
    delete response.refreshTokenCookie;
    res.json(response).end();
  }

  @ResetPasswordApiDocs()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto, @Res() res: Response) {
    const response = await this.authService.resetPassword(body);
    res.setHeader('Set-Cookie', [response.refreshTokenCookie.cookie]);
    res.json({ token: response.token }).end();
  }

  @ForgotPasswordApiDocs()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() { email }: ForgotPasswordEmailDto) {
    return this.userService.sendForgotPasswordCode(email);
  }

  @GetLogoutApiDocs()
  @HttpCode(HttpStatus.OK)
  @Post('log-out')
  @UseGuards(JwtAuthGuard)
  async logOut(@GetJwtPayload() user: JwtPayload, @Res() res: Response) {
    await this.userService.removeRefreshToken(user.id);
    res.clearCookie('Refresh');
    res.json().end();
  }
}
