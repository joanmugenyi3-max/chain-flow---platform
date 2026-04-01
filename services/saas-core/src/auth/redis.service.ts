import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  // Key prefixes
  private readonly PREFIX_BLACKLIST = 'jwt:blacklist:';
  private readonly PREFIX_REFRESH = 'jwt:refresh:';
  private readonly PREFIX_RESET = 'pwd:reset:';
  private readonly PREFIX_INVITE = 'invite:';
  private readonly PREFIX_MFA_SECRET = 'mfa:secret:';
  private readonly PREFIX_MFA_PENDING = 'mfa:pending:';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.get<string>('redis.url', 'redis://localhost:6379');

    this.client = new Redis(redisUrl, {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connection established');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error', err.message);
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('Redis reconnecting...');
    });

    await this.client.ping();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
    this.logger.log('Redis connection closed');
  }

  get redisClient(): Redis {
    return this.client;
  }

  // ── JWT Blacklist ──────────────────────────────────────────────────────────

  async blacklistToken(token: string, expiresInSeconds: number): Promise<void> {
    const key = `${this.PREFIX_BLACKLIST}${token}`;
    await this.client.setex(key, expiresInSeconds, '1');
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `${this.PREFIX_BLACKLIST}${token}`;
    const result = await this.client.exists(key);
    return result === 1;
  }

  // ── Refresh Tokens ─────────────────────────────────────────────────────────

  async storeRefreshToken(
    sessionId: string,
    hashedToken: string,
    expiresInSeconds: number,
  ): Promise<void> {
    const key = `${this.PREFIX_REFRESH}${sessionId}`;
    await this.client.setex(key, expiresInSeconds, hashedToken);
  }

  async getRefreshToken(sessionId: string): Promise<string | null> {
    const key = `${this.PREFIX_REFRESH}${sessionId}`;
    return this.client.get(key);
  }

  async deleteRefreshToken(sessionId: string): Promise<void> {
    const key = `${this.PREFIX_REFRESH}${sessionId}`;
    await this.client.del(key);
  }

  // ── Password Reset ─────────────────────────────────────────────────────────

  async storePasswordResetToken(
    token: string,
    userId: string,
    expiresInSeconds: number = 3600,
  ): Promise<void> {
    const key = `${this.PREFIX_RESET}${token}`;
    await this.client.setex(key, expiresInSeconds, userId);
  }

  async getPasswordResetUserId(token: string): Promise<string | null> {
    const key = `${this.PREFIX_RESET}${token}`;
    return this.client.get(key);
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    const key = `${this.PREFIX_RESET}${token}`;
    await this.client.del(key);
  }

  // ── Invitations ────────────────────────────────────────────────────────────

  async storeInviteToken(
    token: string,
    payload: Record<string, string>,
    expiresInSeconds: number = 7 * 24 * 3600,
  ): Promise<void> {
    const key = `${this.PREFIX_INVITE}${token}`;
    await this.client.setex(key, expiresInSeconds, JSON.stringify(payload));
  }

  async getInvitePayload(
    token: string,
  ): Promise<Record<string, string> | null> {
    const key = `${this.PREFIX_INVITE}${token}`;
    const raw = await this.client.get(key);
    return raw ? JSON.parse(raw) : null;
  }

  async deleteInviteToken(token: string): Promise<void> {
    const key = `${this.PREFIX_INVITE}${token}`;
    await this.client.del(key);
  }

  // ── MFA ───────────────────────────────────────────────────────────────────

  async storePendingMfaSecret(
    userId: string,
    secret: string,
    expiresInSeconds: number = 600,
  ): Promise<void> {
    const key = `${this.PREFIX_MFA_PENDING}${userId}`;
    await this.client.setex(key, expiresInSeconds, secret);
  }

  async getPendingMfaSecret(userId: string): Promise<string | null> {
    const key = `${this.PREFIX_MFA_PENDING}${userId}`;
    return this.client.get(key);
  }

  async deletePendingMfaSecret(userId: string): Promise<void> {
    const key = `${this.PREFIX_MFA_PENDING}${userId}`;
    await this.client.del(key);
  }

  // ── Generic ───────────────────────────────────────────────────────────────

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }
}
