import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ActiveUserGuard, JwtAuthGuard, RolesGuard } from '../../auth/guards';
import { Role } from '../../common/role.decorator';
import { JwtPayload } from '../../common/types';
import { GetJwtPayload } from '../../common/utils/decorators';
import {
  ChangeDataVerifyCodeApiDocs,
  ChangeEmailApiDocs,
  ChangePhoneApiDocs,
  CheckEmailApiDocs,
  GetProfileApiDocs,
  UpdatePasswordApiDocs,
  UpdateProfileApiDocs,
} from '../docs';
import { DeleteUserDocs } from '../docs/delete-user.decorator';
import {
  ChangeEmailDto,
  CheckEmailDto,
  GetAllUsersFilterDto,
  UpdateEmailDto,
  UpdatePasswordDto,
  UpdatePhoneDto,
  UpdateUserDto,
  UserCreateDto,
} from '../dto';
import { UsersRoleEnum } from '../enums';
import { UserService } from '../services';

@ApiBearerAuth('access_token')
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(@Query() filterDto: GetAllUsersFilterDto) {
    return this.userService.findAll(filterDto);
  }

  @GetProfileApiDocs()
  @Get('/profile')
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  async getProfile(@GetJwtPayload() user: JwtPayload) {
    return await this.userService.getProfile(user.id);
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return this.userService.findById(id);
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  public async create(@Body() createUserDto: UserCreateDto) {
    return this.userService.createUser(createUserDto);
  }

  @CheckEmailApiDocs()
  @Post('check-email')
  async checkUserEmailAvailability(@Body() body: CheckEmailDto) {
    await this.userService.checkEmailAvailability({
      email: body.email,
    });
    return { message: 'Email is available' };
  }

  @UpdateProfileApiDocs()
  @Put('/profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  async updateUserProfile(
    @Body() updateDto: UpdateUserDto,
    @GetJwtPayload() { id: userId }: JwtPayload,
  ) {
    return await this.userService.updateUser(updateDto, userId);
  }
  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() updateDto: UpdateUserDto) {
    return await this.userService.updateUser(updateDto, id);
  }

  @ChangeDataVerifyCodeApiDocs()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Post('/change-email/verify-code')
  async getVerifyCodeForEmailChanging(
    @GetJwtPayload() { id: userId }: JwtPayload,
    @Body() changeEmailDto: ChangeEmailDto,
  ) {
    return await this.userService.sendVerifyCode(userId, changeEmailDto.email);
  }

  @ChangeDataVerifyCodeApiDocs()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Post('/change-phone/verify-code')
  async getVerifyCodeForPhoneChanging(
    @GetJwtPayload() { id: userId }: JwtPayload,
  ) {
    return await this.userService.sendVerifyCode(userId);
  }

  @ChangeEmailApiDocs()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Patch('email')
  async changeEmail(
    @Body() updateEmailDto: UpdateEmailDto,
    @GetJwtPayload() { id: userId }: JwtPayload,
  ) {
    return await this.userService.changeEmail(updateEmailDto, userId);
  }

  @ChangePhoneApiDocs()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Patch('phone')
  async changePhone(
    @Body() updatePhoneDto: UpdatePhoneDto,
    @GetJwtPayload() { id: userId }: JwtPayload,
  ) {
    return await this.userService.changePhone(updatePhoneDto, userId);
  }

  @UpdatePasswordApiDocs()
  @Put('password')
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  async updatePassword(
    @Body() body: UpdatePasswordDto,
    @GetJwtPayload() user: JwtPayload,
  ) {
    await this.userService.updatePassword(user.id, body);
    return { message: 'Password was changed successfully' };
  }

  @DeleteUserDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UsersRoleEnum.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userService.remove(id);
  }
}
