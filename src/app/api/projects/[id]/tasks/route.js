import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/lib/models/Project';
import Task from '@/lib/models/Task';
import { authenticate } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

// GET /api/projects/[id]/tasks - Get all tasks for a project
export async function GET(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Check if project exists and user has access
    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    const isOwner = project.owner.toString() === auth.userId;
    const isMember = project.members.some(member => member.toString() === auth.userId);

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Get all tasks for the project
    const tasks = await Task.find({ project: id })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: tasks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get project tasks error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
