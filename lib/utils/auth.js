import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
const JWT_COOKIE_EXPIRE = 30; // 30 days

export const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const setTokenCookie = (response, token) => {
  const expires = new Date(
    Date.now() + JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
  );
  
  // Use Next.js cookies API
  response.cookies.set('token', token, {
    expires: expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
};

export const clearTokenCookie = (response) => {
  // Use Next.js cookies API to delete cookie
  response.cookies.delete('token');
};

