// Sanitization utility functions

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 10000); // Limit length
}

export function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .slice(0, 255); // Email max length
}

export function sanitizeObject(obj, fields) {
  const sanitized = {};
  
  for (const field of fields) {
    if (obj[field] !== undefined) {
      if (typeof obj[field] === 'string') {
        sanitized[field] = sanitizeInput(obj[field]);
      } else {
        sanitized[field] = obj[field];
      }
    }
  }
  
  return sanitized;
}

