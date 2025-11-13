// Simple in-memory rate limiter for API routes
// For production, consider using Redis with @upstash/ratelimit

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Maximum requests per interval
}

export function rateLimit(config: RateLimitConfig) {
  return {
    check: async (identifier: string): Promise<{ success: boolean; remaining: number }> => {
      const now = Date.now()
      const key = identifier

      // Clean up expired entries
      if (store[key] && store[key].resetTime < now) {
        delete store[key]
      }

      // Initialize or get current state
      if (!store[key]) {
        store[key] = {
          count: 0,
          resetTime: now + config.interval
        }
      }

      // Increment count
      store[key].count++

      const success = store[key].count <= config.maxRequests
      const remaining = Math.max(0, config.maxRequests - store[key].count)

      return { success, remaining }
    }
  }
}

// Preset configurations
export const rateLimitPresets = {
  // 10 requests per 10 seconds
  strict: { interval: 10000, maxRequests: 10 },
  
  // 30 requests per minute
  moderate: { interval: 60000, maxRequests: 30 },
  
  // 100 requests per minute
  lenient: { interval: 60000, maxRequests: 100 },
  
  // 5 requests per minute (for sensitive operations)
  sensitive: { interval: 60000, maxRequests: 5 }
}
