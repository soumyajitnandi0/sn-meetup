import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const user = await User.findById(auth.userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
