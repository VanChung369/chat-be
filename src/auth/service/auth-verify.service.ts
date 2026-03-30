import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { MailService } from '../../mail/service/mail.service.js';

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
   * Generates a code, saves it to cache with 120s TTL, and queues the verification email.
   * @param email The recipient's email address.
   */
  async sendVerificationCode(email: string) {
    const code = this.generateCode();
    
    // Save to cache (TTL is in milliseconds for modern cache-manager)
    await this.cacheManager.set(`verify_code_${email}`, code, 120000); 
    
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
    const savedCode = await this.cacheManager.get<string>(`verify_code_${email}`);
    
    if (savedCode && savedCode === code) {
      await this.cacheManager.del(`verify_code_${email}`);
      return true;
    }
    
    return false;
  }
}
