/**
 * Simple Rate Limiting Middleware
 * This provides basic rate limiting functionality to prevent API abuse
 * Note: In production, consider using a dedicated rate limiting solution like redis-rate-limit
 */

const rateLimitMap = new Map();

/**
 * Create rate limiting middleware
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.max - Maximum requests per window (default: 100)
 * @param {string} options.message - Error message when limit exceeded
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = 'Too many requests from this IP, please try again later'
  } = options;

  return (req, res, next) => {
    // Get client IP (considering proxy headers)
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               'unknown';

    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create rate limit data for this IP
    let rateLimitData = rateLimitMap.get(ip);

    if (!rateLimitData || rateLimitData.windowStart < windowStart) {
      // Create new window
      rateLimitData = {
        windowStart: now,
        requestCount: 0,
        requests: []
      };
      rateLimitMap.set(ip, rateLimitData);
    }

    // Increment request count
    rateLimitData.requestCount++;
    rateLimitData.requests.push(now);

    // Clean up old requests outside the current window
    rateLimitData.requests = rateLimitData.requests.filter(timestamp => timestamp >= windowStart);
    rateLimitData.requestCount = rateLimitData.requests.length;

    // Add rate limit headers to response
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - rateLimitData.requestCount));
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitData.windowStart + windowMs).toISOString());

    // Check if limit exceeded
    if (rateLimitData.requestCount > max) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfter: Math.ceil((rateLimitData.windowStart + windowMs - now) / 1000),
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

// Clean up old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const windowStart = now - windowMs;

  for (const [ip, data] of rateLimitMap.entries()) {
    if (data.windowStart < windowStart) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Pre-configured rate limiters for different endpoint types
const defaultRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per 15 minutes
});

const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // 50 requests per 15 minutes
});

const transferRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10 // 10 transfers per minute
});

module.exports = {
  createRateLimiter,
  defaultRateLimiter,
  strictRateLimiter,
  transferRateLimiter
};
