import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomBytes, randomUUID } from 'crypto';
import { UserVerifyCodeType } from '../types/user-verify-code.type';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UserVerification } from '../entities/user-verification.entity';
import { ENTITIES } from '../../common/enums/entities';
import { UserVerificationType } from '../types/user-verification.type';

@Injectable()
export class UserVerificationService {
  private BYTES_OFFSET = 0;
  private BYTES_LENGTH = 3;
  private DIGITS_LENGTH = 1000000; // limit the number to 6 digits
  private DIGITS_LIMIT = 6;
  private readonly EXPIRED_AFTER = 3 * (6 * 6 * 100000); // 3 hours
  constructor(
    @Inject(ENTITIES.USER_VERIFICATION)
    private readonly userVerification: UserVerificationType,
    @InjectRepository(UserVerification)
    private readonly userVerificationRepository: Repository<UserVerification>,
  ) {}

  async createVerificationCode(data: Partial<UserVerification>) {
    const verification = new this.userVerification();
    Object.assign<UserVerification, Partial<UserVerification>>(
      verification,
      data,
    );
    return await this.userVerificationRepository.save(verification);
  }

  async getVerificationCode(
    user: User,
    options?: { isResetCode?: boolean; expiredAfter?: number; email?: string },
  ) {
    const expiredAt = new Date(
      Date.now() + (options?.expiredAfter ?? this.EXPIRED_AFTER),
    );
    const code = options?.isResetCode
      ? randomUUID()
      : this.generateRandomNumberString();
    const verificationData: Partial<UserVerification> = {
      expiredAt,
      code,
      user,
      email: options.email,
    };
    return this.createVerificationCode(verificationData);
  }

  async validateVerificationCode({
    code,
    email,
    newEmail,
  }: UserVerifyCodeType) {
    const verificationCode = await this.userVerificationRepository.findOne({
      where: {
        code,
        user: {
          email,
        },
      },
      relations: {
        user: true,
      },
    });
    if (!verificationCode?.code) throw new BadRequestException('Invalid code');
    if (newEmail && verificationCode.email !== newEmail)
      throw new BadRequestException('Invalid email');
    await this.checkExpiration(verificationCode);
    return verificationCode;
  }

  async deleteCode(code: UserVerification) {
    await this.userVerificationRepository.delete({ id: code.id });
  }

  private async checkExpiration(userVerificationData: UserVerification) {
    if (userVerificationData.expiredAt.getTime() < new Date().getTime()) {
      await this.deleteCode(userVerificationData);
      throw new BadRequestException('Verification time expired');
    }
  }

  private generateRandomNumberString(): string {
    const buffer = randomBytes(3);
    const randomNumber =
      buffer.readUIntBE(this.BYTES_OFFSET, this.BYTES_LENGTH) %
      this.DIGITS_LENGTH;
    return randomNumber.toString().padStart(this.DIGITS_LIMIT, '0');
  }
}
