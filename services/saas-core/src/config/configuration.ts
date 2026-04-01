export interface AppConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  redis: {
    url: string;
    ttl: number;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
    publishableKey: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  mfa: {
    appName: string;
  };
  throttle: {
    ttl: number;
    limit: number;
  };
  allowedOrigins: string;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '4007', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  databaseUrl: process.env.DATABASE_URL ?? '',

  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    ttl: parseInt(process.env.REDIS_TTL ?? '3600', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'changeme-jwt-secret',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ?? 'changeme-jwt-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? '',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ??
      'http://localhost:4007/api/auth/google/callback',
  },

  mfa: {
    appName: process.env.MFA_APP_NAME ?? 'ChainFlow',
  },

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },

  allowedOrigins: process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000',
});
