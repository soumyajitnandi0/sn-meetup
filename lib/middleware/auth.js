import { NextResponse } from 'next/server';
import { verifyToken } from '../utils/auth.js';
import { cookies } from 'next/headers';

export async function authenticate(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return {
        error: NextResponse.json(
          { success: false, message: 'Authentication required' },
          { status: 401 }
        ),
      };
    }

    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      return {
        error: NextResponse.json(
          { success: false, message: 'Invalid token' },
          { status: 401 }
        ),
      };
    }

    return { userId: decoded.id };
  } catch (error) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }
}

