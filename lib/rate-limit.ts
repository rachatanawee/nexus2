type RateLimitConfig = {
  interval: number // milliseconds
  uniqueTokenPerInterval: number
}

const cache = new Map<string, number[]>()

export function rateLimit(config: RateLimitConfig) {
  return {
    check: (limit: number, token: string) => {
      const now = Date.now()
      const tokenKey = `${token}`
      const timestamps = cache.get(tokenKey) || []
      
      // Remove old timestamps
      const validTimestamps = timestamps.filter(
        (timestamp) => now - timestamp < config.interval
      )
      
      if (validTimestamps.length >= limit) {
        return { success: false, remaining: 0, reset: validTimestamps[0] + config.interval }
      }
      
      validTimestamps.push(now)
      cache.set(tokenKey, validTimestamps)
      
      return { 
        success: true, 
        remaining: limit - validTimestamps.length,
        reset: now + config.interval
      }
    }
  }
}

// Preset configurations
export const limiter = {
  api: rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 }), // 60 req/min
  auth: rateLimit({ interval: 15 * 60 * 1000, uniqueTokenPerInterval: 100 }), // 15 min window
}
