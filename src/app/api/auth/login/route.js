import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken, setTokenCookie } from '@/lib/utils/auth';

export async function POST(request) {
  try {
    // Validate request body
    const body = await request.json();
    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    try {
      await dbConnect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { success: false, message: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }

    // Normalize email (lowercase, trim) - must match registration normalization
    const normalizedEmail = email.toLowerCase().trim();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check for user with normalized email
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user._id);

    // Create HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set cookie
    setTokenCookie(response, token);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle connection errors
    if (error.name === 'MongooseError' || error.message?.includes('connect')) {
      return NextResponse.json(
        { success: false, message: 'Cannot connect to database. Please check your connection.' },
        { status: 500 }
      );
    }
    
    // Handle mongoose errors
    if (error.name === 'MongoServerError') {
      return NextResponse.json(
        { success: false, message: 'Database error. Please try again.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: error.message || 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
