import { NextResponse } from 'next/server';
import { clearTokenCookie } from '@/lib/utils/auth';

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    clearTokenCookie(response);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
