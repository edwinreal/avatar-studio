import rateLimit from "express-rate-limit";

// General rate limit: 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});

// Auth rate limit: 5 attempts per 15 minutes (stricter for auth endpoints)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Only count failed attempts
});

// API rate limit: 50 requests per minute for general API usage
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: "Too many API requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
