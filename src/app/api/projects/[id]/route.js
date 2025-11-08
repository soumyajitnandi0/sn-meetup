import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/lib/models/Project';
import Task from '@/lib/models/Task';
import { authenticate } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

// Helper function to check if user has access to project
async function checkProjectAccess(projectId, userId) {
  const project = await Project.findById(projectId);
  
  if (!project) {
    return { error: 'Project not found', status: 404 };
  }

  const isOwner = project.owner.toString() === userId;
  const isMember = project.members.some(member => member.toString() === userId);

  if (!isOwner && !isMember) {
    return { error: 'Access denied', status: 403 };
  }

  return { project, isOwner };
}

// GET /api/projects/[id] - Get project details
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

    const access = await checkProjectAccess(id, auth.userId);
    if (access.error) {
      return NextResponse.json(
        { success: false, message: access.error },
        { status: access.status }
      );
    }

    // Populate owner and members
    await access.project.populate('owner', 'name email avatar');
    await access.project.populate('members', 'name email avatar');

    return NextResponse.json(
      {
        success: true,
        data: access.project,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update project
export async function PATCH(request, { params }) {
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

    const access = await checkProjectAccess(id, auth.userId);
    if (access.error) {
      return NextResponse.json(
        { success: false, message: access.error },
        { status: access.status }
      );
    }

    // Only owner can update project
    if (!access.isOwner) {
      return NextResponse.json(
        { success: false, message: 'Only project owner can update project' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, status, members } = body;

    // Update allowed fields
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (status !== undefined) updates.status = status;
    if (members !== undefined) updates.members = members;
    updates.updatedAt = Date.now();

    const project = await Project.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update project error:', error);
    
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

// DELETE /api/projects/[id] - Delete project and associated tasks
export async function DELETE(request, { params }) {
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

    const access = await checkProjectAccess(id, auth.userId);
    if (access.error) {
      return NextResponse.json(
        { success: false, message: access.error },
        { status: access.status }
      );
    }

    // Only owner can delete project
    if (!access.isOwner) {
      return NextResponse.json(
        { success: false, message: 'Only project owner can delete project' },
        { status: 403 }
      );
    }

    // Delete all tasks associated with the project
    await Task.deleteMany({ project: id });

    // Delete the project
    await Project.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Project and associated tasks deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
