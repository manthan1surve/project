/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and API abuse
 */
const rateLimit = require('express-rate-limit');

// Strict limiter for authentication endpoints
// 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: {
        error: 'Too many authentication attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
});

// General API limiter
// 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        error: 'Too many requests. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for NFT minting (expensive operation)
// 5 mints per hour per IP
const mintLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 mints per hour
    message: {
        error: 'Minting limit reached. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter, mintLimiter };
