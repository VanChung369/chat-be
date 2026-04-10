import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { timingSafeEqual } from 'crypto';
import { MailService } from '../../mail/service/mail.service';
import {
  TTL_RESET_PASSWORD_CODE,
  TTL_VERIFY_CODE,
} from '../../common/constants';

@Injectable()
export class AuthVerifyService {
  private readonly logger = new Logger(AuthVerifyService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly mailService: MailService,
  ) {}

  /**
   * Generates a random 6-digit verification code.
   */
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generates a code, saves it to cache with TTL_VERIFY_CODE (1 hour), and queues the verification email.
   * @param email The recipient's email address.
   */
  async sendVerificationCode(email: string) {
    const code = this.generateCode();

    // Save to cache (TTL is in milliseconds for modern cache-manager)
    await this.cacheManager.set(`verify_code_${email}`, code, TTL_VERIFY_CODE);

    this.logger.log(`Generated verification code for ${email}`);

    // Queue the email sending job
    await this.mailService.sendVerificationEmail(email, code);

    return code;
  }

  /**
   * Verifies the provided code against the cached code for the given email.
   * @param email The recipient's email address.
   * @param code The code to verify.
   * @returns boolean True if the code is valid.
   */
  async verifyCode(email: string, code: string): Promise<boolean> {
    const savedCode = await this.cacheManager.get<string>(
      `verify_code_${email}`,
    );

    if (
      savedCode &&
      savedCode.length === code.length &&
      timingSafeEqual(Buffer.from(savedCode), Buffer.from(code))
    ) {
      await this.cacheManager.del(`verify_code_${email}`);
      return true;
    }

    return false;
  }

  /**
   * Generates a code, saves it to cache with TTL_RESET_PASSWORD_CODE (30 minutes), and queues the reset email.
   * @param email The recipient's email address.
   */
  async sendResetPasswordCode(email: string) {
    const code = this.generateCode();

    // Save to cache (TTL is in milliseconds for modern cache-manager)
    await this.cacheManager.set(
      `reset_code_${email}`,
      code,
      TTL_RESET_PASSWORD_CODE,
    );

    this.logger.log(`Generated reset password code for ${email}`);

    // Queue the email sending job
    await this.mailService.sendResetPasswordEmail(email, code);

    return code;
  }

  /**
   * Verifies the reset code against the cached code for the given email.
   * @param email The recipient's email address.
   * @param code The code to verify.
   * @returns boolean True if the code is valid.
   */
  async verifyResetCode(email: string, code: string): Promise<boolean> {
    const savedCode = await this.cacheManager.get<string>(
      `reset_code_${email}`,
    );

    if (
      savedCode &&
      savedCode.length === code.length &&
      timingSafeEqual(Buffer.from(savedCode), Buffer.from(code))
    ) {
      await this.cacheManager.del(`reset_code_${email}`);
      return true;
    }

    return false;
  }
}
