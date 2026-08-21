export interface RateLimitConfig {
  max: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  contact: {
    ip: {
      max: 3,
      windowMs: 15 * 60 * 1000, // 15 Minutes
    },
    email: {
      max: 3,
      windowMs: 15 * 60 * 1000, // 15 Minutes
    },
  },
  seoAudit: {
    ip: {
      max: 5,
      windowMs: 10 * 60 * 1000, // 10 Minutes
    },
  },
  aiGenerate: {
    ip: {
      max: 10,
      windowMs: 60 * 60 * 1000, // 1 Hour
    },
    account: {
      max: 10,
      windowMs: 60 * 60 * 1000, // 1 Hour
    },
  },
  adminApi: {
    ip: {
      max: 30,
      windowMs: 15 * 60 * 1000, // 30 Requests / 15 Minutes
    },
    account: {
      max: 30,
      windowMs: 15 * 60 * 1000, // 30 Requests / 15 Minutes
    },
  },
  restaurant: {
    order: {
      ip: {
        max: 20,
        windowMs: 60 * 1000, // 20 requests / min
      },
    },
    session: {
      ip: {
        max: 30,
        windowMs: 60 * 1000, // 30 requests / min
      },
    },
    waiterCall: {
      ip: {
        max: 10,
        windowMs: 60 * 1000, // 10 requests / min
      },
    },
    webhook: {
      ip: {
        max: 60,
        windowMs: 60 * 1000, // 60 requests / min
      },
    },
  },
} as const;
