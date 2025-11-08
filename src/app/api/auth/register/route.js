import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken, setTokenCookie } from '@/lib/utils/auth';

export async function POST(request) {
  try {
    // Validate request body
    const body = await request.json();
    const { name, email, password } = body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
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

    // Normalize email (lowercase)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }
    
    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

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
      { status: 201 }
    );

    // Set cookie
    setTokenCookie(response, token);

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation error', errors },
        { status: 400 }
      );
    }
    
    // Handle duplicate key error (MongoDB)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Handle mongoose errors
    if (error.name === 'MongoServerError') {
      if (error.code === 11000) {
        return NextResponse.json(
          { success: false, message: 'User with this email already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'Database error. Please try again.' },
        { status: 500 }
      );
    }
    
    // Handle connection errors
    if (error.name === 'MongooseError' || error.message?.includes('connect')) {
      return NextResponse.json(
        { success: false, message: 'Cannot connect to database. Please check your connection.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: error.message || 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
