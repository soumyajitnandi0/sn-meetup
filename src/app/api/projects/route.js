import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/lib/models/Project';
import { authenticate } from '@/lib/middleware/auth';

// GET /api/projects - List all projects for authenticated user
export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    // Find projects where user is owner or member
    const projects = await Project.find({
      $or: [
        { owner: auth.userId },
        { members: auth.userId }
      ]
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: projects,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const body = await request.json();
    const { name, description, status, members } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Project name is required' },
        { status: 400 }
      );
    }

    // Create project with authenticated user as owner
    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || '',
      status: status || 'active',
      owner: auth.userId,
      members: members || [],
    });

    // Populate owner and members
    await project.populate('owner', 'name email avatar');
    await project.populate('members', 'name email avatar');

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create project error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation error', errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
