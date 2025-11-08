import { NextResponse } from 'next/server';

// Simple in-memory rate limiter
const rateLimitMap = new Map();

export function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
  } = options;

  return async (request) => {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const key = `rate-limit:${ip}`;
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now - record.resetTime > windowMs) {
      // Create new record
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      
      // Clean up old records periodically
      if (Math.random() < 0.01) { // 1% chance to clean up
        for (const [k, v] of rateLimitMap.entries()) {
          if (now - v.resetTime > windowMs) {
            rateLimitMap.delete(k);
          }
        }
      }
      
      return null; // No rate limit exceeded
    }

    if (record.count >= max) {
      return NextResponse.json(
        { success: false, message: 'Too many requests, please try again later' },
        { status: 429 }
      );
    }

    // Increment count
    record.count++;
    rateLimitMap.set(key, record);
    
    return null; // No rate limit exceeded
  };
}

