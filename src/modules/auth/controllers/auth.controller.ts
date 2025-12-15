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
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { LoginDto } from '../../../common/dto';
import { CONFIG } from '../../../common/enums';
import { JwtPayload } from '../../../common/types';
import { GetJwtPayload } from '../../../common/utils/decorators';
import { GetLogoutApiDocs, GetRefreshApiDocs } from '../../user/docs';
import { UsersRoleEnum } from '../../user/enums';
import { UserService } from '../../user/services/user.service';
import {
  ForgotPasswordApiDocs,
  LoginApiDocs,
  RegisterApiDocs,
  ResetPasswordApiDocs,
} from '../docs';
import { ForgotPasswordEmailDto, RegisterDto, ResetPasswordDto } from '../dto';
import { GoogleAuthGuard, JwtAuthGuard, JwtRefreshGuard } from '../guards';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly baseFrontendUrl: string;
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.baseFrontendUrl = this.configService.get(CONFIG.FRONTEND_URL);
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
  googleLogin() {}

  @Get('/google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleRedirect(@Req() req: Request, @Res() res: Response) {
    const token = await this.authService.generateToken({
      id: req.user.id,
      role: req.user.role as UsersRoleEnum,
    });
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
